from pyspark.sql import SparkSession

def get_spark_session(app_name: str = "vori-analytics") -> SparkSession:
    """Spark 세션 생성 및 설정"""
    return (SparkSession.builder
            .appName(app_name)
            .master("spark://spark-master:7077")
            .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoint")
            .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.3.0")
            # 병렬 처리 설정
            .config("spark.streaming.concurrentJobs", "5")  # 동시 실행 작업 수
            .config("spark.default.parallelism", "10")     # 기본 병렬 처리 수준
            .config("spark.sql.shuffle.partitions", "10")  # SQL 셔플 파티션 수
            .getOrCreate()) 