from pyspark.sql import DataFrame
from pyspark.sql.functions import (
    count, avg, col, when, sum, 
    window, datediff, from_unixtime
)
import logging

logger = logging.getLogger(__name__)

class TicketAnalyzer:
    def __init__(self, spark_session):
        self.spark = spark_session
        logger.info("TicketAnalyzer initialized with Spark session")
        
    def analyze_status_changes(self, history_df: DataFrame) -> DataFrame:
        """상태 변경 패턴 분석"""
        logger.info("Starting status change analysis")
        result = (
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
        logger.info(f"Status change analysis completed. Row count: {result.count()}")
        return result
    
    def calculate_metrics(self, 
            ticket_df: DataFrame,
            history_df: DataFrame,
            window_duration: str = "1 minute") -> DataFrame:
        """회의별 메트릭스 계산"""
        logger.info(f"Calculating metrics with window duration: {window_duration}")
        logger.debug(f"Input ticket_df count: {ticket_df.count()}")
        logger.debug(f"Input history_df count: {history_df.count()}")
        
        result = (
            ticket_df
            .withWatermark("timestamp", "2 minutes")
            .groupBy(
                window(col("timestamp"), window_duration),
                "meetingId"
            )
            .agg(
                sum(
                    when(col("status") != "TODO", 1)
                    .otherwise(0)
                ).alias("actionableItemsCount"),
                
                count("status").alias("statusUpdatesCount"),
                
                sum(
                    when(
                        col("content").rlike("(?i)blocker|차단"), 1
                    ).otherwise(0)
                ).alias("blockersMentioned")
            )
        )
        
        logger.info("Metrics calculation completed")
        logger.debug(f"Output metrics shape: {result.columns}, {result.count()} rows")
        return result 