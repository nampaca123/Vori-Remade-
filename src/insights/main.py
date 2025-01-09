import asyncio
import os
from prisma import Prisma
from pyspark.sql import DataFrame
from utils.spark_session import get_spark_session
from utils.kafka_utils import get_kafka_stream, write_to_kafka, KAFKA_TOPICS, SCHEMAS
from jobs.meeting_metrics import MeetingMetricsAnalyzer
from jobs.ticket_analysis import TicketAnalyzer
from models.productivity import MeetingAnalysisModel

async def write_to_db(df: DataFrame, prisma: Prisma, metric_type: str):
    """Spark 분석 결과를 DB에 저장"""
    print(f"Starting DB write for metric type: {metric_type}")
    try:
        for row in df.collect():
            print(f"Processing row for {metric_type}:", row)
            if metric_type == "ticket":
                await prisma.ticketPatternAnalysis.create(
                    data={
                        'meetingId': row.meetingId,
                        'avgStatusChangeDuration': float(row.avg_days_to_change),
                        'blockerCount': row.blockersMentioned
                    }
                )
                print(f"Created ticket pattern analysis for meeting {row.meetingId}")
            elif metric_type == "realtime":
                await prisma.realTimeMetrics.create(
                    data={
                        'meetingId': row.meetingId,
                        'windowStart': row.window.start,
                        'windowEnd': row.window.end,
                        'productivityScore': float(row.productivity_score),
                        'ticketCount': row.statusUpdatesCount,
                        'actionableCount': row.actionableItemsCount
                    }
                )
                print(f"Created realtime metrics for meeting {row.meetingId}")
            elif metric_type == "productivity":
                await prisma.productivityPattern.upsert(
                    where={
                        'hourOfDay': row.hour_of_day
                    },
                    create={
                        'hourOfDay': row.hour_of_day,
                        'avgScore': float(row.avg_score),
                        'meetingCount': 1
                    },
                    update={
                        'avgScore': float(row.avg_score),
                        'meetingCount': row.meeting_count
                    }
                )
                print(f"Upserted productivity pattern for hour {row.hour_of_day}")
    except Exception as e:
        print(f"Error in write_to_db for {metric_type}:", str(e))
        raise

async def main():
    print("Starting analytics pipeline...")
    # 환경변수 확인
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise EnvironmentError("DATABASE_URL environment variable is not set")

    print("Initializing Spark session...")
    # Spark 세션 생성
    spark = get_spark_session("vori-insights")
    
    # Prisma 클라이언트 초기화
    prisma = Prisma()
    
    try:
        print("Connecting to Prisma...")
        # Prisma 연결
        await prisma.connect()
        print("Prisma connected successfully")
        
        # 분석기 초기화
        print("Initializing analyzers...")
        metrics_analyzer = MeetingMetricsAnalyzer(spark)
        text_analyzer = MeetingAnalysisModel(spark)
        ticket_analyzer = TicketAnalyzer(spark)
        
        # Kafka 스트림 연결
        print("Connecting to Kafka streams...")
        transcription_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
            schema=SCHEMAS["TRANSCRIPTION"]
        )
        print(f"Connected to transcription stream: {KAFKA_TOPICS['TRANSCRIPTION']['COMPLETED']}")
        
        ticket_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TICKET"]["CREATED"],
            schema=SCHEMAS["TICKET"]
        )
        print(f"Connected to ticket creation stream: {KAFKA_TOPICS['TICKET']['CREATED']}")
        
        ticket_update_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TICKET"]["UPDATED"],
            schema=SCHEMAS["TICKET"]
        )
        print(f"Connected to ticket update stream: {KAFKA_TOPICS['TICKET']['UPDATED']}")
        
        # 티켓 분석 처리
        print("Starting ticket metrics calculation...")
        ticket_metrics = ticket_analyzer.calculate_metrics(
            ticket_df=ticket_stream,
            history_df=ticket_update_stream
        )
        print("Ticket metrics calculation completed")
        
        # 텍스트 분석 처리
        print("Starting text analysis...")
        analyzed_text = text_analyzer.extract_keywords(transcription_stream)
        topic_clusters = text_analyzer.cluster_topics(analyzed_text)
        print("Text analysis completed")
        
        # 생산성 메트릭스 계산
        print("Calculating productivity scores...")
        productivity_scores = metrics_analyzer.calculate_productivity_score(
            transcription_df=analyzed_text,
            ticket_df=ticket_stream
        )
        print("Productivity score calculation completed")

        # DB에 분석 결과 저장
        print("Saving analysis results to database...")
        await write_to_db(ticket_metrics, prisma, "ticket")
        await write_to_db(productivity_scores, prisma, "realtime")
        await write_to_db(topic_clusters, prisma, "productivity")
        print("Database writes completed")
        
        # Kafka로 결과 전송
        print("Sending results to Kafka...")
        write_to_kafka(
            ticket_metrics,
            topic="analytics.ticket.metrics",
            checkpoint_location="/tmp/checkpoints/ticket_metrics"
        )
        print("Results sent to Kafka successfully")
        
        # 스트림 처리 시작
        print("Starting stream processing...")
        query = productivity_scores.writeStream \
            .outputMode("append") \
            .format("console") \
            .start()
            
        print("Awaiting stream termination...")
        query.awaitTermination()
        
        # 트렌드 분석 처리
        print("Starting trend analysis...")
        groups = await prisma.group.find_many(
            select={
                'groupId': True
            }
        )
        print(f"Found {len(groups)} groups for trend analysis")

        # 그룹별 트렌드를 단일 토픽으로 전송
        for group in groups:
            print(f"Processing trends for group {group['groupId']}...")
            trend_metrics = await metrics_analyzer.calculate_trend_metrics(
                realtime_metrics_df=productivity_scores,
                meeting_metrics_df=ticket_metrics,
                group_id=group['groupId']
            )
            
            # groupId를 메시지 데이터에 포함
            print(f"Sending trend metrics for group {group['groupId']} to Kafka...")
            write_to_kafka(
                {
                    "groupId": group['groupId'],
                    "metrics": trend_metrics
                },
                topic="analytics.trends.groups",
                checkpoint_location="/tmp/checkpoints/trends"
            )
            print(f"Trend metrics sent for group {group['groupId']}")
        
    except Exception as e:
        print(f"Error in main: {str(e)}")
        raise
    finally:
        print("Cleaning up resources...")
        await prisma.disconnect()
        spark.stop()
        print("Resources cleaned up successfully")

if __name__ == "__main__":
    asyncio.run(main()) 