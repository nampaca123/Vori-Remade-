from pyspark.ml.feature import HashingTF, IDF, Word2Vec, Tokenizer
from pyspark.ml import Pipeline
from pyspark.sql import DataFrame
from pyspark.sql.functions import array, col

class MeetingAnalysisModel:
    def __init__(self, spark_session):
        self.spark = spark_session
        
    def extract_keywords(self, transcription_df: DataFrame) -> DataFrame:
        """TF-IDF로 중요 키워드 추출"""
        tokenizer = Tokenizer(inputCol="text", outputCol="words")
        hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures")
        idf = IDF(inputCol="rawFeatures", outputCol="features")
        
        pipeline = Pipeline(stages=[tokenizer, hashingTF, idf])
        model = pipeline.fit(transcription_df)
        
        return model.transform(transcription_df)
    
    def cluster_topics(self, transcription_df: DataFrame) -> DataFrame:
        """Word2Vec으로 유사 토픽 클러스터링"""
        word2Vec = Word2Vec(
            vectorSize=100,
            minCount=0,
            inputCol="words",
            outputCol="features"
        )
        
        model = word2Vec.fit(transcription_df)
        return model.transform(transcription_df) 