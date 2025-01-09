from pyspark.sql import DataFrame
from pyspark.sql.functions import (
    count, avg, col, when, sum, 
    window, datediff, from_unixtime
)

class TicketAnalyzer:
    def __init__(self, spark_session):
        self.spark = spark_session
        
    def analyze_status_changes(self, history_df: DataFrame) -> DataFrame:
        """상태 변경 패턴 분석"""
        return (
            history_df
            .groupBy("ticketId")
            .agg(
                count("historyId").alias("status_change_count"),
                avg(
                    datediff(
                        col("changedAt"),
                        col("createdAt")
                    )
                ).alias("avg_days_to_change")
            )
        )
    
    def calculate_metrics(self, 
            ticket_df: DataFrame,
            history_df: DataFrame,
            window_duration: str = "1 minute") -> DataFrame:
        """회의별 메트릭스 계산"""
        return (
            ticket_df
            .withWatermark("timestamp", "2 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
            .agg(
                # 실행 가능한 작업 수
                sum(
                    when(col("status") != "TODO", 1)
                    .otherwise(0)
                ).alias("actionableItemsCount"),
                
                # 상태 업데이트 수
                count("status").alias("statusUpdatesCount"),
                
                # 블로커 언급 수 (content에 'blocker' 또는 '차단' 포함)
                sum(
                    when(
                        col("content").rlike("(?i)blocker|차단"), 1
                    ).otherwise(0)
                ).alias("blockersMentioned")
            )
        ) 