from pyspark.sql import SparkSession

def create_spark_session(app_name: str = "vori-analytics") -> SparkSession:
    """Spark 세션 생성 및 설정"""
    return (SparkSession.builder
            .appName(app_name)
            .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoint")
            .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.3.0")
            .getOrCreate())

def get_spark_session(app_name: str = "vori-analytics") -> SparkSession:
    """기존 세션 반환 또는 새 세션 생성"""
    try:
        return SparkSession.builder.getOrCreate()
    except Exception:
        return create_spark_session(app_name) 