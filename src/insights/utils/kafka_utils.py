from typing import Dict
from pyspark.sql import DataFrame
from pyspark.sql.streaming import DataStreamReader
from pyspark.sql.types import StructType, StringType, TimestampType, StructField
import logging

logger = logging.getLogger(__name__)

# Kafka 토픽 정의
KAFKA_TOPICS = {
    "TRANSCRIPTION": {
        "COMPLETED": "transcription.completed"
    },
    "TICKET": {
        "CREATED": "ticket.created",
        "UPDATED": "ticket.updated"
    }
}

# 스키마 정의
SCHEMAS = {
    "TRANSCRIPTION": StructType([
        StructField("meetingId", StringType(), True),
        StructField("text", StringType(), True),
        StructField("timestamp", TimestampType(), True)
    ]),
    
    "TICKET": StructType([
        StructField("ticketId", StringType(), True),
        StructField("meetingId", StringType(), True),
        StructField("status", StringType(), True),
        StructField("title", StringType(), True),
        StructField("timestamp", TimestampType(), True)
    ])
}

def get_kafka_stream(spark, topic: str, schema: StructType) -> DataFrame:
    """Kafka 스트림 데이터 읽기"""
    logger.info(f"Initializing Kafka stream for topic: {topic}")
    stream = (spark
            .readStream
            .format("kafka")
            .option("kafka.bootstrap.servers", "kafka:9092")
            .option("subscribe", topic)
            .option("group.id", "vori-spark-analytics")
            .option("startingOffsets", "latest")
            .option("maxOffsetsPerTrigger", "1000")
            .option("fetchOffset.numRetries", "5")
            .option("failOnDataLoss", "false")
            .option("spark.streaming.kafka.maxRatePerPartition", "100")
            .load())
    
    logger.info(f"Stream loaded for topic: {topic}")
    result = (stream
            .selectExpr("CAST(value AS STRING) as json")
            .select("from_json(json, schema) as data")
            .select("data.*"))
    logger.info(f"Stream transformation completed for topic: {topic}")
    return result

def write_to_kafka(df: DataFrame, topic: str, checkpoint_location: str):
    """Kafka로 데이터 쓰기"""
    logger.info(f"Starting write stream to topic: {topic}")
    logger.debug(f"Using checkpoint location: {checkpoint_location}")
    
    stream = (df.writeStream
            .format("kafka")
            .option("kafka.bootstrap.servers", "kafka:9092")
            .option("topic", topic)
            .option("checkpointLocation", checkpoint_location)
            .start())
    
    logger.info(f"Write stream started for topic: {topic}")
    return stream
