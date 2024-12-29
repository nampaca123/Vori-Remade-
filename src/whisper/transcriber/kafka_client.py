from kafka import KafkaConsumer, KafkaProducer
import json
import os

KAFKA_BROKER = os.getenv('KAFKA_BROKERS', 'localhost:9092')

consumer = KafkaConsumer(
    'audio.processed',
    bootstrap_servers=[KAFKA_BROKER],
    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
    group_id='whisper-service-group'
)

producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda x: json.dumps(x).encode('utf-8')
) 