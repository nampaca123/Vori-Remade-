from pyspark.sql import DataFrame
from pyspark.sql.functions import (
    window, count, avg, col, when, sum,
    from_unixtime, unix_timestamp, hour
)

class MeetingMetricsAnalyzer:
    def __init__(self, spark_session):
        self.spark = spark_session
        
    def calculate_productivity_score(self, 
            transcription_df: DataFrame,
            ticket_df: DataFrame,
            window_duration: str = "1 minute") -> DataFrame:
        """회의 생산성 점수 계산
        
        회의 생산성 점수 = (생성된 실행 가능 티켓 수 × 0.4) + 
                          (의사결정 소요 시간 점수 × 0.3) + 
                          (참여도 점수 × 0.3)
                          
        Returns:
            DataFrame: 회의별, 시간대별 생산성 점수
        """
        # 윈도우 기반 집계
        windowed_metrics = (
            transcription_df
            .withWatermark("timestamp", "2 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
        )
        
        # 티켓 생성 수 계산
        ticket_counts = (
            ticket_df
            .withWatermark("timestamp", "10 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
            .agg(
                count("ticketId").alias("ticket_count"),
                # 실행 가능한 티켓 수 (상태가 TODO가 아닌 것)
                sum(when(col("status") != "TODO", 1).otherwise(0))
                .alias("actionable_tickets")
            )
        )
        
        # 최종 생산성 점수 계산
        return (
            windowed_metrics
            .join(ticket_counts, ["window", "meetingId"])
            .withColumn(
                "productivity_score",
                # 임시 가중치: 실행 가능 티켓(0.6), 티켓 수(0.4)
                col("actionable_tickets") * 0.6 + 
                col("ticket_count") * 0.4
            )
        )
    
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