# VORI - Voice to Report (Remaster)

![VORI Logo](https://raw.githubusercontent.com/nampaca123/Vori_Reborn/main/voriLogo.png)

실시간 음성 회의 내용을 텍스트화하고 칸반보드와 연동하여 작업을 자동화하는 프로젝트의 리마스터 버전입니다.
이전 AWS 기반 프로젝트를 완전한 로컬 환경으로 마이그레이션하여, 클라우드 의존성을 제거하고 더 유연하고 비용 효율적인 시스템을 구축하는 것을 목표로 합니다.

## 프로젝트 배경

### 기존 AWS 프로젝트 플로우
1. 클라이언트에서 오디오 스트림 시작
   - API Gateway를 통해 1분 단위로 오디오 데이터 전송
   - 티켓 상태 업데이트 요청 처리

2. 오디오 처리 파이프라인
   - Lambda를 통해 인증 및 메시지 큐 처리
   - MSK(Kafka)를 통한 오디오 데이터 스트리밍
   - 실시간 오디오 버퍼 처리 및 S3 저장

3. 음성 인식 및 텍스트 처리
   - AWS Transcribe로 음성-텍스트 변환
   - 변환된 텍스트에서 주요 정보 추출
   - Bedrock을 통한 회의 내용 요약 및 작업 추출

4. 티켓 관리 시스템
   - 자동 티켓 생성 및 상태 업데이트
   - 회의 내용 기반 작업 할당
   - 실시간 칸반보드 동기화

### AWS 프로젝트 상세 구현

#### 1. API Gateway에서 MSK로의 오디오 스트리밍
API Gateway를 통해 클라이언트로부터 받은 오디오 버퍼를 MSK(Managed Kafka)로 전달하는 Lambda 함수를 구현했습니다. 이 함수는 base64로 인코딩된 오디오 데이터를 받아 Kafka 토픽으로 전송합니다.

**Lambda 함수 코드:**

```python
from kafka import KafkaProducer
import json

def lambda_handler(event, context):
    bootstrap_servers = [
        "b-1.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092",
        "b-3.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092",
        "b-2.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092"
    ]

    producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        security_protocol="PLAINTEXT",
        request_timeout_ms=2000,
        retries=3,
        retry_backoff_ms=200,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    print("Received event: ", json.dumps(event, indent=2))
    print("Headers: ", event.get('headers'))
    print("Body: ", event.get('body'))

    randomkey = event['headers']['randomkey']
    event_body = json.loads(event['body'])
    audioDataBase64 = event_body['body']

    message = {
        'randomkey': randomkey,
        'audiodata': audioDataBase64
    }

    try:
        producer.send('voriAudioStream', message)
        producer.flush()
        return {
            'statusCode': 200,
            'body': 'Data successfully sent to MSK'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Failed to send data to MSK: {e}'
        }
    finally:
        producer.close()
```

#### 2. MSK 토픽 및 파티션 설정
EC2 인스턴스에서 Kafka 클러스터의 토픽과 파티션을 구성했습니다. 5개의 파티션을 생성하여 병렬 처리 능력을 향상시켰습니다.

**토픽 생성 명령어:**

```bash
bin/kafka-topics.sh --create \
    --bootstrap-server b-1.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092 \
    --replication-factor 1 \
    --partitions 5 \
    --topic voriAudioStream
```

#### 3. MSK와 Lambda 이벤트 매핑
Lambda의 자동 동시성 처리 기능을 활용하여 단일 Lambda 함수로 MSK의 여러 파티션의 메시지를 효율적으로 처리했습니다.

**이벤트 매핑 명령어:**

```bash
aws lambda create-event-source-mapping \
    --function-name vori_fromMskToS3_partition0 \
    --event-source-arn arn:aws:kafka:us-east-1:823401933116:cluster/vorikafka/985aecc8-9c79-4031-ab8f-088222c95a6d-12 \
    --batch-size 1 \
    --starting-position LATEST \
    --topics voriAudioStream
```

#### 4. S3 저장 및 처리 완료 시그널링
오디오 버퍼를 S3에 저장하고, 모든 데이터가 수신되면 end.txt 파일을 생성하는 Lambda 함수를 구현했습니다.

**Lambda 함수 코드:**

```python
import boto3
import json
import os
import time
from kafka import KafkaConsumer, TopicPartition
from datetime import datetime

KAFKA_BOOTSTRAP_SERVERS = [
    "b-1.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092",
    "b-3.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092",
    "b-2.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092"
]

TOPIC = "voriAudioStream"
PARTITIONS = [0, 1, 2, 3, 4]
S3_BUCKET = "voriaudio"
s3_client = boto3.client("s3")

def lambda_handler(event, context):
    try:
        consumer = KafkaConsumer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id="lambda-group",
            auto_offset_reset="latest",
            enable_auto_commit=False,
            value_deserializer=lambda x: json.loads(x.decode("utf-8"))
        )
        topic_partitions = [TopicPartition(TOPIC, partition) for partition in PARTITIONS]
        consumer.assign(topic_partitions)

        start_time = time.time()
        while time.time() - start_time < 900:
            for message in consumer:
                data = message.value
                randomkey = data["randomkey"]
                audio_data_base64 = data["audiodata"]

                if audio_data_base64 == "-":
                    end_file_path = create_end_txt(randomkey)
                    upload_to_s3(randomkey, end_file_path, file_type="end")
                    os.remove(end_file_path)
                    break

                out_file_path = save_base64_to_file(audio_data_base64, randomkey)
                upload_to_s3(randomkey, out_file_path)
                consumer.commit()
                os.remove(out_file_path)

        return {
            "statusCode": 200,
            "body": "Lambda executed successfully for 15 minutes"
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"Critical Error: {e}"
        }

def save_base64_to_file(audio_data_base64, randomkey):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    out_file_path = f"/tmp/{randomkey}{timestamp}.out"
    with open(out_file_path, "w") as out_file:
        out_file.write(audio_data_base64)
    return out_file_path

def upload_to_s3(randomkey, file_path, file_type="out"):
    s3_object_key = f"{randomkey}/{'end.txt' if file_type == 'end' else os.path.basename(file_path)}"
    s3_client.upload_file(file_path, S3_BUCKET, s3_object_key)

def create_end_txt(randomkey):
    end_file_path = f"/tmp/end_{randomkey}.txt"
    with open(end_file_path, "w") as end_file:
        end_file.write("Recording Finished")
    return end_file_path
```

#### 5. 주요 기술적 도전과 해결

![awsVori_VPCEndpoint_Lesson](https://raw.githubusercontent.com/nampaca123/Vori_Reborn/main/awsVori_VPCEndpoint_Lesson.png)

##### 문제:
Lambda와 MSK가 VPC 내에 배포되었지만, S3와의 연결에 문제가 있었습니다. NAT 게이트웨이와 인터넷 게이트웨이를 구성했음에도 불구하고 S3와의 통신이 어려웠습니다.

##### 원인:
Lambda와 MSK는 VPC 내부에 있었던 반면, S3는 외부에 위치해 있었습니다. AWS는 이와 같은 상황에서 NAT 게이트웨이나 인터넷 게이트웨이를 사용하는 것을 권장하지 않습니다. 이는 AWS의 서비스 아키텍처 설계 원칙과 맞지 않기 때문입니다. 그러므로 해당 방법은 IAM 권한 설정과 관련된 다양한 설정이 복잡해지는 단점이 있으며, 효율적인 네트워크 구성에는 적합하지 않습니다.

##### 해결 방안:
VPC Endpoint를 생성하여 Lambda와 S3 간에 AWS 내부에서 프라이빗 연결을 설정했습니다. 이를 통해 외부 인터넷 트래픽을 경유하지 않고도 안전하게 연결할 수 있었으며, 권한 설정도 간소화되었습니다. 또한, AWS 내에서 프라이빗 네트워크가 형성되어 보안이 강화되었습니다. 또한, NAT 게이트웨이를 사용하지 않음으로써 네트워크 트래픽에 따른 추가 비용을 절감할 수 있었습니다.

##### 배운 점:
이 문제를 통해 AWS 네트워크 구성에 대한 이해를 넓힐 수 있었으며, AWS의 권장 사항에 따라 인프라 구성 요소를 정렬하는 것이 얼마나 중요한지 배웠습니다. 비용 절감과 더불어 보안성과 관리 편의성을 모두 향상시킬 수 있었습니다.

### 주요 마이그레이션 포인트
- AWS MSK → Apache Kafka (로컬)
- AWS Transcribe → Whisper
- AWS Bedrock → OpenAI GPT API
- AWS S3 → 로컬 파일 시스템
- AWS Lambda → Express.js 엔드포인트

# 데이터 파이프라인 아키텍처

## 데이터 흐름

```plaintext
클라이언트 (음성)
      ↓
Express.js 서버 (메인 서버)
      ↓
Kafka (audio.raw)
      ↓
FastAPI 서버 (Whisper 서비스)
      ↓
Kafka (transcription.completed)
      ↓
Express.js 서버 (메인 서버)
      ↓---------------→ WebSocket (실시간 업데이트)
      ↓
PostgreSQL
```

## 아키텍처 설계 의도

1. **분산 처리를 통한 성능 최적화**
   - 무거운 음성 인식 작업을 별도 서버로 분리
   - 메인 서버의 응답성 유지
   - GPU 리소스의 효율적 활용

2. **안정성과 확장성**
   - Kafka를 통한 데이터 손실 방지
   - 각 서버의 독립적 스케일링 가능
   - 서버 장애 시에도 데이터 보존

3. **실시간성 확보**
   - WebSocket을 통한 즉각적인 피드백
   - 평균 처리 시간 3-4초 달성
   - 비동기 처리를 통한 응답 지연 최소화

### 핵심 기술 선택 이유

1. **Express.js & FastAPI 조합**
   - Express.js: 안정적인 클라이언트 통신 처리
   - FastAPI: 비동기 처리에 최적화된 Python 서버
   - 각 언어/프레임워크의 장점 활용

2. **Apache Kafka**
   - 서버 간 안정적인 메시지 전달
   - 시스템 장애 시 데이터 보존
   - 향후 기능 확장을 위한 유연한 토픽 구조

3. **PostgreSQL**
   - 트랜잭션 기반의 데이터 정합성
   - JSON 형식 지원으로 유연한 데이터 저장
   - 복잡한 쿼리 처리 능력

이러한 아키텍처를 통해 실시간 음성 처리의 안정성과 확장성을 모두 확보하면서, 개발 및 유지보수의 효율성도 높일 수 있었습니다.

## 기술 스택

### 백엔드
#### 메인 서버
- TypeScript & Node.js
- Express.js (웹 프레임워크)
- Prisma (ORM)
- PostgreSQL (데이터베이스)

#### 음성 처리 서버
- FastAPI (Python 웹 프레임워크)
- Whisper (OpenAI 음성인식)
- OpenAI GPT API (텍스트 처리)

#### 데이터 처리
- Apache Kafka (메시지 큐)
- Apache Spark & Scala
  - Spark Streaming (실시간 데이터 처리)
  - Spark ML (회의 내용 분석)

#### API 문서화
- Swagger UI

### 프론트엔드
- Next.js (React 프레임워크)
- Firebase Authentication
- TailwindCSS
- React Query
- WebSocket (실시간 통신)

### 개발 환경
- Docker & Docker Compose
- ESLint & Prettier

### 시스템 요구사항
- Docker & Docker Compose (필수)
- Node.js 18+
- Python 3.11+
- Java Runtime Environment 11+
- CUDA 지원 GPU (선택사항)

## 주요 기능

### 실시간 음성 처리
- 음성 스트리밍 및 텍스트 변환 (평균 지연시간 3-4초)
- WebSocket을 통한 실시간 피드백

### 작업 자동화
- 회의 내용 기반 작업 자동 생성
- 칸반보드 자동 업데이트
- 회의록 자동 생성

### 데이터 분석
- Spark ML을 활용한 회의 내용 분석
- 키워드 추출 및 트렌드 분석
- 회의 효율성 지표 생성

## 설치 방법
(추후 작성 예정)

## API 문서
(추후 작성 예정)

## 라이선스
MIT License
