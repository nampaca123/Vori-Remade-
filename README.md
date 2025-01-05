# VORI - Voice to Report (Remaster)

![VORI Logo](https://raw.githubusercontent.com/nampaca123/Vori_Reborn/main/voriLogo.png)

실시간 음성 회의 내용을 텍스트화하고 작업 티켓으로 자동 변환하는 지능형 회의 관리 시스템입니다. 
이전 AWS 기반 프로젝트를 완전한 로컬 환경으로 마이그레이션하는 것을 넘어, 다음과 같은 고도화된 기능들을 제공합니다:

- WebSocket 기반 실시간 음성 처리 및 텍스트 피드백
- Spark Streaming을 활용한 회의 효율성 분석 및 인사이트 도출
- 데이터 기반의 작업 관리 자동화 및 최적화 제안
- 확장 가능한 분산 처리 아키텍처

본 프로젝트는 단순한 회의록 작성 도구를 넘어, 조직의 의사결정과 업무 프로세스를 개선하는 종합적인 솔루션을 목표로 합니다.

## 목차
1. [프로젝트 배경](#프로젝트-배경)
   AWS 기반 프로젝트의 흐름, 상세 구현 내용 및 마이그레이션 계획

2. [데이터 파이프라인 아키텍처](#데이터-파이프라인-아키텍처)
   데이터 흐름도, 분산 처리 구조, 실시간성 확보 방안 및 기술 스택 선정 이유

3. [핵심 기능](#핵심-기능)
   - [실시간 음성 처리](#실시간-음성-처리)
   - [티켓 자동 생성 시스템](#티켓-자동-생성-시스템)
   - [회의 분석 파이프라인](#회의-분석-파이프라인)

4. [기술 스택 및 요구사항](#기술-스택)
   개발 환경 구성 및 시스템 요구사항

5. [설치 및 실행](#설치-방법)

6. [API 문서](#api-문서)

7. [라이선스](#라이선스)

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

## 티켓 자동 생성 시스템

### 개요
회의 내용을 자동으로 분석하여 작업 티켓을 생성하고 관리하는 시스템입니다. 현재는 회의 종료 시점에 일괄 처리 방식으로 구현하되, 추후 실시간 WebSocket 기반으로 마이그레이션할 수 있는 확장성 있는 구조로 설계합니다.

### 프로세스 흐름

1. **회의 종료 감지**
   - 임시 방안: 클라이언트에서 `/api/meetings/{meetingId}/end` API 호출
   - 향후 계획: WebSocket 연결 종료 또는 일정 시간 동안의 무음 감지

2. **트랜스크립트 수집 및 정리**
   - 동일한 meetingId를 가진 모든 Meeting 레코드 조회
   - createdAt 타임스탬프 기준으로 정렬
   - transcript 필드들을 시간 순서대로 연결
   - 중복 내용 제거 및 문맥 정리

3. **Claude API 통합**
   - 입력: 정리된 회의 내용 전문
   - 요청: 작업 상태별(TODO, IN_PROGRESS, DONE) 분류
   - 응답 형식: Prisma Ticket 모델과 호환되는 JSON 배열
   ```json
   {
     "tickets": [
       {
         "title": "string",
         "content": "string",
         "status": "TODO" | "IN_PROGRESS" | "DONE",
         "meetingId": number
       }
     ]
   }
   ```

4. **티켓 생성 및 저장**
   - Claude API 응답을 Ticket 모델로 변환
   - Prisma를 통한 일괄 티켓 생성
   - 생성된 티켓 목록 클라이언트에 반환

5. **에러 처리 및 복구**
   - 부분적 성공에 대한 처리 (일부 티켓만 생성된 경우)
   - 실패한 요청에 대한 재시도 메커니즘
   - 상세 에러 로깅

### 구현 시 고려사항

1. **확장성**
   - WebSocket 기반 실시간 처리로의 마이그레이션 용이성
   - 다양한 LLM 모델 지원 가능성
   - 멀티 테넌트 지원

2. **신뢰성**
   - 중복 티켓 생성 방지
   - 트랜잭션 처리
   - 데이터 정합성 보장

3. **성능**
   - 대용량 트랜스크립트 처리
   - Claude API 요청 최적화
   - 비동기 처리를 통한 응답 시간 최소화

### 향후 개선 계획

1. **실시간 처리**
   - WebSocket 기반 실시간 음성 인식
   - 스트리밍 방식의 티켓 생성
   - 실시간 피드백 시스템

2. **정확도 향상**
   - 컨텍스트 인식 개선
   - 작업 상태 분류 정확도 향상
   - 중복 감지 알고리즘 개선

### 티켓 상태 자동 갱신
1. **회의 중 티켓 상태 감지**
   - 기존 티켓의 상태 변경 사항 자동 인식
   - 예시 시나리오:
     ```
     "백엔드 API 문서화 작업을 현재 진행하고 있습니다." 
     → 해당 티켓 상태 'TODO' → 'IN_PROGRESS' 자동 갱신
     
     "프론트엔드 로그인 페이지 구현이 완료되었습니다." 
     → 해당 티켓 상태 'IN_PROGRESS' → 'DONE' 자동 갱신
     ```

2. **상태 변경 프로세스**
   - 회의 내용에서 기존 티켓 제목과 매칭되는 키워드 추출
   - 문맥 기반 상태 변경 의도 파악
   - Prisma를 통한 티켓 상태 업데이트
   - 변경 이력 추적 및 로깅

3. **정확도 향상 방안**
   - 유사도 기반 티켓 매칭 (제목 완전 일치가 아닌 경우 대응)
   - 상태 변경 의도 명확성 검증
   - 변경 전 현재 상태 확인 (잘못된 상태 전이 방지)

4. **실시간 동기화**
   - 상태 변경 시 WebSocket을 통한 즉시 알림
   - 칸반보드 실시간 업데이트
   - 관련 팀원들에게 상태 변경 알림

## 회의 분석 파이프라인

### 개요
Spark Streaming과 Kafka를 활용하여 실시간 회의 데이터를 분석하고, 조직의 의사결정 패턴과 생산성을 측정하는 시스템입니다.

### 데이터 수집 및 처리
1. **실시간 데이터 소스** (Kafka 토픽)
   - `transcription.completed`: 음성 인식 결과
   - `ticket.created`: 생성된 작업 티켓
   - `ticket.updated`: 상태 변경된 티켓

2. **Spark Streaming 분석**
   - 5초 간격의 마이크로 배치 처리
   - 실시간 지표 계산 및 이상 감지
   - 회의 효율성 점수 산출

### 주요 분석 지표

1. **회의 생산성 지표**
   ```
   회의 생산성 점수 = (생성된 실행 가능 티켓 수 × 가중치) + 
                      (의사결정 소요 시간 점수) + 
                      (참여도 점수)
   ```

2. **시계열 기반 패턴 분석**
   - 시간대별 생산성 변화
   - 요일/시간별 최적 회의 시간 추천
   - 회의 길이와 생산성의 상관관계

3. **작업 흐름 분석**
   - 티켓 상태 전이 시간 추적
   - 병목 구간 자동 감지
   - 팀별 작업 처리 패턴 비교

### 실시간 인사이트 예시
- "오전 10시 회의에서 평균 23% 더 많은 실행 가능한 티켓 생성"
- "특정 주제 논의 시 의사결정 시간 35% 단축"
- "백엔드 관련 티켓이 'IN_PROGRESS' 상태에 평균 3일 체류"

### 기술적 구현

1. **데이터 파이프라인 구조**
   - Kafka → Spark Streaming → PostgreSQL/Redis
   - 실시간 처리: 5초 마이크로 배치
   - 배치 처리: 일간/주간 집계

2. **주요 처리 단계**
   a. **데이터 수집 (Kafka)**
      - 음성 인식 결과 (transcription.completed)
      - 티켓 생성/변경 이벤트
      - 회의 메타데이터

   b. **실시간 처리 (Spark Streaming)**
      - 구조화된 스트리밍으로 실시간 집계
      - 윈도우 기반 통계 처리 (5분/30분/1시간)
      - 이상 패턴 감지

   c. **텍스트 분석 (Spark ML)**
      - TF-IDF로 키워드 추출
      - Word2Vec으로 토픽 클러스터링
      - 시계열 패턴 분석

   d. **결과 저장 및 서빙**
      - PostgreSQL: 장기 데이터 저장
      - Redis: 실시간 지표 캐싱
      - WebSocket: 실시간 대시보드 업데이트

3. **핵심 기술 컴포넌트**
   - Spark ML의 자연어 처리 파이프라인
   - Spark Structured Streaming
   - Kafka Streams (상태 관리)
   - Redis Pub/Sub (실시간 업데이트)

4. **성능 최적화**
   - 파티셔닝: meetingId 기반
   - 캐싱: 빈번한 집계 결과
   - 백프레셔 처리: Kafka 컨슈머 조정

5. **확장성 고려사항**
   - 수평적 확장: Kafka 파티션 증설
   - 수직적 확장: Spark executor 리소스 조정
   - 데이터 보존: 콜드 스토리지 아카이빙

### 비즈니스 가치
1. **데이터 기반 의사결정**
   - 회의 시간 최적화
   - 팀 생산성 향상
   - 의사결정 프로세스 개선

2. **자동화된 인사이트**
   - 실시간 피드백 제공
   - 팀 성과 지표 자동 생성
   - 개선 포인트 자동 감지

3. **확장성**
   - 새로운 분석 지표 쉽게 추가 가능
   - 다양한 데이터 소스 통합 용이
   - 실시간/배치 처리 유연한 전환

## 설치 방법
(추후 작성 예정)

## API 문서(추후 작성 예정)

## 라이선스
MIT License
