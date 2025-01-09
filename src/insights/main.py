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
    for row in df.collect():
        if metric_type == "ticket":
            await prisma.ticketPatternAnalysis.create(
                data={
                    'meetingId': row.meetingId,
                    'avgStatusChangeDuration': float(row.avg_days_to_change),
                    'blockerCount': row.blockersMentioned
                }
            )
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

async def main():
    # 환경변수 확인
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise EnvironmentError("DATABASE_URL environment variable is not set")

    # Spark 세션 생성
    spark = get_spark_session("vori-insights")
    
    # Prisma 클라이언트 초기화
    prisma = Prisma()
    
    try:
        # Prisma 연결
        await prisma.connect()
        
        # 분석기 초기화
        metrics_analyzer = MeetingMetricsAnalyzer(spark)
        text_analyzer = MeetingAnalysisModel(spark)
        ticket_analyzer = TicketAnalyzer(spark)
        
        # Kafka 스트림 연결
        transcription_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
            schema=SCHEMAS["TRANSCRIPTION"]
        )
        
        ticket_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TICKET"]["CREATED"],
            schema=SCHEMAS["TICKET"]
        )
        
        ticket_update_stream = get_kafka_stream(
            spark=spark,
            topic=KAFKA_TOPICS["TICKET"]["UPDATED"],
            schema=SCHEMAS["TICKET"]
        )
        
        # 티켓 분석 처리
        ticket_metrics = ticket_analyzer.calculate_metrics(
            ticket_df=ticket_stream,
            history_df=ticket_update_stream
        )
        
        # 텍스트 분석 처리
        analyzed_text = text_analyzer.extract_keywords(transcription_stream)
        topic_clusters = text_analyzer.cluster_topics(analyzed_text)
        
        # 생산성 메트릭스 계산
        productivity_scores = metrics_analyzer.calculate_productivity_score(
            transcription_df=analyzed_text,
            ticket_df=ticket_stream
        )

        # DB에 분석 결과 저장
        await write_to_db(ticket_metrics, prisma, "ticket")
        await write_to_db(productivity_scores, prisma, "realtime")
        await write_to_db(topic_clusters, prisma, "productivity")
        
        # Kafka로 결과 전송
        write_to_kafka(
            ticket_metrics,
            topic="analytics.ticket.metrics",
            checkpoint_location="/tmp/checkpoints/ticket_metrics"
        )
        
        # 스트림 처리 시작
        query = productivity_scores.writeStream \
            .outputMode("append") \
            .format("console") \
            .start()
            
        query.awaitTermination()
        
        # 트렌드 분석 처리
        groups = await prisma.group.find_many(
            select={
                'groupId': True
            }
        )

        # 그룹별 트렌드를 단일 토픽으로 전송
        for group in groups:
            trend_metrics = await metrics_analyzer.calculate_trend_metrics(
                realtime_metrics_df=productivity_scores,
                meeting_metrics_df=ticket_metrics,
                group_id=group['groupId']
            )
            
            # groupId를 메시지 데이터에 포함
            write_to_kafka(
                {
                    "groupId": group['groupId'],
                    "metrics": trend_metrics
                },
                topic="analytics.trends.groups",
                checkpoint_location="/tmp/checkpoints/trends"
            )
        
    except Exception as e:
        print(f"Error in main: {str(e)}")
        raise
    finally:
        await prisma.disconnect()
        spark.stop()

if __name__ == "__main__":
    asyncio.run(main()) 