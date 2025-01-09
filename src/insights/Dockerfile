FROM bitnami/spark:3.3.0

USER root

# Python 패키지 설치를 위한 기본 도구 설치
RUN apt-get update && \
    apt-get install -y python3-pip && \
    pip3 install --upgrade pip

# 작업 디렉토리 설정
WORKDIR /app

# 파이썬 패키지 설치
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Spark 설정
ENV SPARK_HOME=/opt/bitnami/spark
ENV PATH=$PATH:$SPARK_HOME/bin
ENV SPARK_MASTER_HOST=spark-master
ENV SPARK_MASTER_PORT=7077
ENV SPARK_MASTER_WEBUI_PORT=8080
ENV SPARK_WORKER_WEBUI_PORT=8081

# 시작 스크립트 설정
COPY start-spark.sh /
RUN chmod +x /start-spark.sh

# Python 애플리케이션 복사
COPY . .

EXPOSE 8080 8081 7077
ENTRYPOINT ["/start-spark.sh"]