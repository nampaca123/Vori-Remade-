from utils import get_spark_session, get_kafka_stream, KAFKA_TOPICS, SCHEMAS
from jobs import MeetingMetricsAnalyzer
from models import MeetingAnalysisModel

def main():
    # Spark 세션 생성
    spark = get_spark_session("vori-insights")
    
    # 분석기 초기화
    metrics_analyzer = MeetingMetricsAnalyzer(spark)
    text_analyzer = MeetingAnalysisModel(spark)
    
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
    
    # 텍스트 분석 처리
    analyzed_text = text_analyzer.extract_keywords(transcription_stream)
    topic_clusters = text_analyzer.cluster_topics(analyzed_text)
    
    # 생산성 메트릭스 계산
    productivity_scores = metrics_analyzer.calculate_productivity_score(
        transcription_df=analyzed_text,
        ticket_df=ticket_stream
    )
    
    # 결과를 콘솔에 출력 (테스트용)
    query = (productivity_scores
            .writeStream
            .outputMode("append")
            .format("console")
            .start())
    
    query.awaitTermination()

if __name__ == "__main__":
    main() 