#!/bin/bash

# Spark 로그 디렉토리 생성
mkdir -p /opt/bitnami/spark/logs

if [ "$SPARK_MODE" = "master" ]; then
    /opt/bitnami/spark/sbin/start-master.sh
elif [ "$SPARK_MODE" = "worker" ]; then
    /opt/bitnami/spark/sbin/start-worker.sh spark://spark-master:7077
fi

# 로그 모니터링
tail -f /opt/bitnami/spark/logs/*