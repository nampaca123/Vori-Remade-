from pyspark.sql import DataFrame
from pyspark.sql.functions import (
    window, count, avg, col, when, sum,
    from_unixtime, unix_timestamp, hour
)
import logging

logger = logging.getLogger(__name__)

class MeetingMetricsAnalyzer:
    def __init__(self, spark_session):
        self.spark = spark_session
        logger.info("MeetingMetricsAnalyzer initialized")
        
    def calculate_productivity_score(self, 
            transcription_df: DataFrame,
            ticket_df: DataFrame,
            window_duration: str = "1 minute") -> DataFrame:
        """회의 생산성 점수 계산"""
        logger.info("Starting productivity score calculation")
        logger.debug(f"Input shapes - Transcription: {transcription_df.count()}, Tickets: {ticket_df.count()}")
        
        # 윈도우 기반 집계
        logger.info("Creating windowed metrics")
        windowed_metrics = (
            transcription_df
            .withWatermark("timestamp", "2 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
        )
        
        # 티켓 생성 수 계산
        logger.info("Calculating ticket counts")
        ticket_counts = (
            ticket_df
            .withWatermark("timestamp", "10 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
            .agg(
                count("ticketId").alias("ticket_count"),
                sum(when(col("status") != "TODO", 1).otherwise(0))
                .alias("actionable_tickets")
            )
        )
        logger.debug(f"Ticket counts calculated: {ticket_counts.count()} rows")
        
        # 최종 생산성 점수 계산
        logger.info("Computing final productivity scores")
        result = (
            windowed_metrics
            .join(ticket_counts, ["window", "meetingId"])
            .withColumn(
                "productivity_score",
                col("actionable_tickets") * 0.6 + 
                col("ticket_count") * 0.4
            )
        )
        
        logger.info("Productivity score calculation completed")
        logger.debug(f"Final result shape: {result.count()} rows")
        return result
    
    def detect_patterns(self, metrics_df: DataFrame) -> DataFrame:
        """시간대별 패턴 분석"""
        return (
            metrics_df
            .withColumn(
                "hour_of_day",
                hour(col("window.start"))
            )
            .groupBy("hour_of_day")
            .agg(
                avg("productivity_score").alias("avg_productivity"),
                count("meetingId").alias("meeting_count")
            )
            .orderBy("hour_of_day")
        )
    
    def analyze_workflow(self, ticket_df: DataFrame) -> DataFrame:
        """작업 흐름 분석 (상태 전이 시간)"""
        return (
            ticket_df
            .withWatermark("timestamp", "1 day")
            .groupBy("status")
            .agg(
                count("ticketId").alias("ticket_count"),
                avg(
                    unix_timestamp("timestamp") -
                    unix_timestamp("created_at")
                ).alias("avg_time_in_status")
            )
        ) 
    
    async def calculate_trend_metrics(self, 
            realtime_metrics_df: DataFrame,
            meeting_metrics_df: DataFrame,
            group_id: int) -> DataFrame:
        """그룹별 트렌드 분석"""
        
        # RealTimeMetrics와 Meeting 조인
        combined_metrics = (
            realtime_metrics_df
            .join(
                meeting_metrics_df,
                ["meetingId"]
            )
            .where(col("groupId") == group_id)
        )
        
        # 주간/월간 집계
        return (
            combined_metrics
            .groupBy(
                window("windowStart", "7 days").alias("period"),
            )
            .agg(
                avg("productivityScore").alias("avg_productivity"),
                avg("actionableItemsCount").alias("avg_actionable_items"),
                avg("statusUpdatesCount").alias("avg_status_updates"),
                count("meetingId").alias("meeting_count")
            )
            .orderBy("period")
        ) 