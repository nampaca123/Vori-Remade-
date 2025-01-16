# VORI Remade - Voice to Workflow Intelligence

![VORI Logo](https://raw.githubusercontent.com/nampaca123/Vori_Reborn/main/voriLogo.png)

## 프로젝트 소개 | Project Introduction

VORI Remade는 조직의 생산성을 극대화하는 지능형 비즈니스 인사이트 플랫폼입니다. 회의 내용을 자동으로 분석하여 작업 티켓을 생성하고, 진행 상황을 추적하며, 업무 흐름을 최적화합니다.

VORI Remade is an intelligent business insight platform that maximizes organizational productivity. It automatically analyzes meeting content to create work tickets, track progress, and optimize workflows.

이전 AWS 서비스에 크게 의존하던 구조에서 벗어나, 확장성과 성능, 비용 효율성에 중점을 둔 새로운 아키텍처로 재구성되었습니다. Whisper, Kafka, Spark, PostgreSQL 등의 핵심 기술들이 마이크로서비스 아키텍처로 구현되어 각 컴포넌트의 독립적인 스케일링이 가능합니다.

Moving away from heavy reliance on AWS services, it has been reconstructed with a new architecture focusing on scalability, performance, and cost efficiency. Core technologies such as Whisper, Kafka, Spark, and PostgreSQL are implemented in a microservice architecture, enabling independent scaling of each component.

### 주요 기술 스택 | Core Tech Stack
<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/socketio/socketio-original.svg" alt="WebSocket" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/apachekafka/apachekafka-original.svg" alt="Kafka" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/fastapi/fastapi-original.svg" alt="FastAPI" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/apache/apache-original.svg" alt="Spark" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="NodeJS" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="Express" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/prisma/prisma-original.svg" alt="Prisma" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" height="40"/>
</div>

### 주요 특징 | Key Features
- 실시간 음성 처리 및 텍스트 변환 (Whisper) | Real-time voice processing and text conversion (Whisper)
- 분산 메시징 시스템을 통한 안정적인 데이터 처리 (Kafka) | Reliable data processing through distributed messaging system (Kafka)
- 대규모 회의 데이터 분석 및 인사이트 도출 (Spark) | Large-scale meeting data analysis and insight derivation (Spark)
- 작업 관리 자동화 및 최적화 | Work management automation and optimization
- 마이크로서비스 기반의 확장 가능한 아키텍처 | Scalable architecture based on microservices

본 프로젝트는 단순한 회의록 작성 도구를 넘어, 조직의 의사결정과 업무 프로세스를 혁신하는 종합적인 솔루션을 목표로 합니다.

## 목차 | Table of Contents

1. [데이터 파이프라인 아키텍처 | Data Pipeline Architecture](#데이터-파이프라인-아키텍처--data-pipeline-architecture)
   데이터 흐름도, 분산 처리 구조, 실시간성 확보 방안 및 기술 스택 선정 이유
   Data flow diagram, distributed processing structure, real-time processing strategy, and technology stack selection rationale

2. [핵심 기능 | Core Features](#핵심-기능--core-features)
   - [실시간 음성 처리 | Real-time Voice Processing](#실시간-음성-처리--real-time-voice-processing)
   - [티켓 자동 생성 시스템 | Automated Ticket Generation System](#티켓-자동-생성-시스템--automated-ticket-generation-system)
   - [회의 분석 파이프라인 | Meeting Analysis Pipeline](#회의-분석-파이프라인--meeting-analysis-pipeline)

3. [기술 스택 및 요구사항 | Tech Stack and Requirements](#기술-스택-및-요구사항--tech-stack-and-requirements)
   개발 환경 구성 및 시스템 요구사항
   Development environment setup and system requirements

4. [레거시 프로젝트 | Legacy Project](#레거시-프로젝트--legacy-project)
   AWS 기반 프로젝트의 흐름, 상세 구현 내용 및 마이그레이션 계획
   AWS-based project flow, detailed implementation, and migration plan

5. [설치 및 실행 | Installation and Setup](#설치-및-실행--installation-and-setup)

6. [API 문서 | API Documentation](#api-문서--api-documentation)

7. [라이선스 | License](#라이선스--license)

# 데이터 파이프라인 아키텍처 | Data Pipeline Architecture

## 데이터 흐름 | Data Flow

### 1. 실시간 텍스트 처리 파이프라인 | Real-time Text Processing Pipeline
```plaintext
클라이언트 (음성) | Client (Voice)
      ↓
FastAPI 서버 (WebSocket) | FastAPI Server (WebSocket)
      ↓
Whisper 음성인식 | Whisper Speech Recognition
      ↓
실시간 텍스트 피드백 (WebSocket) | Real-time Text Feedback (WebSocket)
      ↓
Kafka (transcription.completed)
      ↓
Express.js 서버 | Express.js Server
      ↓
PostgreSQL
```

### 2. 비즈니스 인사이트 파이프라인 | Business Insight Pipeline
```plaintext
PostgreSQL (회의 데이터 | Meeting Data)
      ↓
PySpark Streaming
      ↓
실시간 분석 (1분 윈도우) | Real-time Analysis (1-minute window)
  - 회의 생산성 점수 | Meeting Productivity Score
  - 작업 처리 패턴 | Task Processing Patterns
  - 키워드 트렌드 | Keyword Trends
      ↓
트렌드 분석 (7일 윈도우) | Trend Analysis (7-day window)
  - 그룹별 생산성 추이 | Group Productivity Trends
  - 작업 완료율 분석 | Task Completion Rate Analysis
      ↓
Kafka (analytics.insights)
      ↓
Express.js 서버 | Express.js Server
```

## 아키텍처 설계 의도 | Architecture Design Rationale

1. **실시간 처리 최적화 | Real-time Processing Optimization**
   - WebSocket과 Whisper를 통한 실시간 음성-텍스트 변환 구현
   - 주기적인 DB 저장을 통한 선제적 작업 처리
   - 프로세스 모니터링 및 상태 추적 시스템

   - Real-time voice-to-text conversion through WebSocket and Whisper
   - Proactive task processing through periodic DB saves
   - Process monitoring and status tracking system

2. **로드밸런싱 | Load Balancing**
   - Kafka를 통한 데이터 손실 방지 및 파티션 기반 확장성 확보
   - Kafka-Spark 연동을 통한 대규모 데이터 안정성 보장
   - 토큰 최적화 및 내부 모델 기반 업무 관리

   - Data loss prevention and partition-based scalability through Kafka
   - Large-scale data stability through Kafka-Spark integration
   - Token optimization and internal model-based task management

3. **마이크로서비스 아키텍처 | Microservice Architecture**
   - 서비스별 독립 서버 운영을 통한 확장성 확보
   - 대용량 요청 및 데이터 처리를 위한 안정적 시스템 구축

   - Scalability through independent server operation per service
   - Stable system for handling large-scale requests and data processing

### 핵심 기술 선택 이유 | Core Technology Selection Rationale

1. **WebSocket & Whisper**
   - 실시간 양방향 통신을 통한 음성 처리 현황 모니터링
   - 녹음 즉시 텍스트화하여 작업 지연 방지
   - 주기적 중간 저장으로 데이터 안정성 확보

   - Real-time monitoring through bidirectional communication
   - Immediate text conversion to prevent task delays
   - Data stability through periodic intermediate saves

2. **Kafka & Spark**
   - 파티셔닝 기반 로드밸런싱 시스템
   - LLM 의존도 감소 및 대규모 데이터의 안정적 처리
   - 분산 처리를 통한 시스템 안정성 확보

   - Partition-based load balancing system
   - Reduced LLM dependency and stable large-scale data processing
   - System stability through distributed processing

3. **Claude 3.5 API & PostgreSQL**
   - Claude의 높은 토큰 처리량 활용
   - Claude-Spark-PostgreSQL 연동을 통한 시계열 분석 등 고급 작업 수행
   - 로컬 DB 활용으로 네트워크 레이턴시 최소화 및 JSON 데이터 안정적 저장

   - Utilizing Claude's high token processing capacity
   - Advanced operations like time series analysis through Claude-Spark-PostgreSQL integration
   - Network latency minimization and stable JSON storage through local DB

# 핵심 기능 | Core Features

### 실시간 음성 처리 | Real-time Voice Processing
- 음성 스트리밍 및 텍스트 변환 (평균 지연시간 3-4초) | Voice streaming and text conversion (average latency 3-4 seconds)
- WebSocket을 통한 실시간 피드백 | Real-time feedback through WebSocket

### 작업 자동화 | Task Automation
- 회의 내용 기반 작업 자동 생성 | Automatic task generation based on meeting content
- 칸반보드 자동 업데이트 | Automatic kanban board updates
- 회의록 자동 생성 | Automatic meeting minutes generation

### 데이터 분석 | Data Analysis
- Spark ML을 활용한 회의 내용 분석 | Meeting content analysis using Spark ML
- 키워드 추출 및 트렌드 분석 | Keyword extraction and trend analysis
- 회의 효율성 지표 생성 | Meeting efficiency metrics generation

## 실시간 음성 처리 | Real-time Voice Processing

### 개요 | Overview
WebSocket을 통해 실시간으로 음성을 수신하고 Whisper 모델을 사용하여 텍스트로 변환하는 시스템입니다. 30초 단위로 중간 저장을 수행하여 데이터 손실을 방지하고, 평균 3초의 지연 시간으로 실시간 피드백을 제공합니다.

A system that receives voice in real-time through WebSocket and converts it to text using the Whisper model. It prevents data loss by performing intermediate saves every 30 seconds and provides real-time feedback with an average latency of 3 seconds.

### 프로세스 흐름 | Process Flow

1. **음성 데이터 수신 및 처리 | Voice Data Reception and Processing**
   - WebSocket을 통한 실시간 오디오 스트림 수신
   - 스레드 풀을 통한 병렬 처리
   - 임시 파일 시스템을 활용한 효율적인 메모리 관리

   - Real-time audio stream reception through WebSocket
   - Parallel processing through thread pool
   - Efficient memory management using temporary file system

2. **텍스트 변환 및 버퍼 관리 | Text Conversion and Buffer Management**
   - Whisper 모델을 통한 고정밀 음성인식
   - 30초 주기의 자동 저장 메커니즘
   - 메모리 효율적인 버퍼 관리

   - High-precision speech recognition through Whisper model
   - Automatic save mechanism at 30-second intervals
   - Memory-efficient buffer management

3. **데이터 전달 및 저장 | Data Delivery and Storage**
   - Kafka를 통한 안정적인 메시지 전달
   - 부분/최종 상태 구분 저장
   - 실시간 피드백을 위한 WebSocket 응답

   - Reliable message delivery through Kafka
   - Partial/final state differentiated storage
   - WebSocket response for real-time feedback

### 구현 시 고려사항 | Implementation Considerations

1. **실시간 처리 최적화 | Real-time Processing Optimization**
   - WebSocket을 통한 양방향 실시간 음성 스트리밍
   - Whisper 모델의 병렬 처리로 평균 3-4초 지연시간 달성
   - 메모리 효율적인 오디오 버퍼 관리

   - Bidirectional real-time voice streaming through WebSocket
   - Average 3-4s latency achieved through Whisper model parallel processing
   - Memory-efficient audio buffer management

2. **데이터 안정성 | Data Stability**
   - 30초 주기의 자동 중간 저장 메커니즘
   - 네트워크 불안정 상황 대비 예외 처리
   - 세션 종료 시 데이터 정리 및 최종 저장

   - Automatic intermediate save mechanism at 30-second intervals
   - Exception handling for network instability
   - Data cleanup and final save on session termination

3. **확장 가능성 | Scalability**
   - Whisper 모델 다양성 활용 (tiny부터 large까지)
   - 오픈소스 기반 커스텀 모델 적용 가능
   - 실시간 처리량에 따른 유연한 리소스 조정

   - Utilizing Whisper model diversity (from tiny to large)
   - Custom model application based on open source
   - Flexible resource adjustment according to real-time throughput

## 티켓 자동 생성 시스템 | Automated Ticket Generation System

### 개요 | Overview
회의 내용을 자동으로 분석하여 작업 티켓을 생성하고 관리하는 시스템입니다. 현재는 회의 종료 시점에 일괄 처리 방식으로 구현하되, 추후 실시간 WebSocket 기반으로 마이그레이션할 수 있는 확장성 있는 구조로 설계합니다.

A system that automatically analyzes meeting content to create and manage work tickets. Currently implemented as a batch process at meeting end, designed with an extensible structure for future migration to real-time WebSocket-based processing.

### 프로세스 흐름 | Process Flow

1. **회의 종료 감지 | Meeting End Detection**
   - 임시 방안: 클라이언트에서 `/api/meetings/{meetingId}/end` API 호출
   - 향후 계획: WebSocket 연결 종료 또는 일정 시간 동안의 무음 감지

   - Temporary solution: Client calls `/api/meetings/{meetingId}/end` API
   - Future plan: WebSocket connection termination or silence detection

2. **트랜스크립트 수집 및 정리 | Transcript Collection and Organization**
   - 동일한 meetingId를 가진 모든 Meeting 레코드 조회
   - createdAt 타임스탬프 기준으로 정렬
   - transcript 필드들을 시간 순서대로 연결
   - 중복 내용 제거 및 문맥 정리

   - Query all Meeting records with the same meetingId
   - Sort by createdAt timestamp
   - Concatenate transcript fields in chronological order
   - Remove duplicates and organize context

3. **Claude API 통합 | Claude API Integration**
   - 입력: 정리된 회의 내용 전문
   - 요청: 작업 상태별(TODO, IN_PROGRESS, DONE) 분류
   - 응답 형식: Prisma Ticket 모델과 호환되는 JSON 배열

   - Input: Organized meeting content
   - Request: Classification by task status (TODO, IN_PROGRESS, DONE)
   - Response format: JSON array compatible with Prisma Ticket model
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

4. **티켓 생성 및 저장 | Ticket Creation and Storage**
   - Claude API 응답을 Ticket 모델로 변환
   - Prisma를 통한 일괄 티켓 생성
   - 생성된 티켓 목록 클라이언트에 반환

   - Convert Claude API response to Ticket model
   - Batch ticket creation through Prisma
   - Return created ticket list to client

5. **에러 처리 및 복구 | Error Handling and Recovery**
   - 부분적 성공에 대한 처리 (일부 티켓만 생성된 경우)
   - 실패한 요청에 대한 재시도 메커니즘
   - 상세 에러 로깅

   - Handling partial success (when only some tickets are created)
   - Retry mechanism for failed requests
   - Detailed error logging

### 구현 시 고려사항 | Implementation Considerations

1. **LLM 활용 최적화 | LLM Utilization Optimization**
   - 복잡한 의사결정이 필요한 작업만 선별적 LLM 활용
   - 맥락 기반 작업 우선순위 자동 설정
   - 시스템 내부 모델을 통한 반복 작업 처리

   - Selective LLM utilization for complex decision-making tasks
   - Context-based automatic task prioritization
   - Repetitive task processing through internal system models

2. **데이터 처리 효율성 | Data Processing Efficiency**
   - 티켓 메타데이터 기반 중복 필터링
   - 작업 이력 추적을 통한 패턴 학습
   - 실시간 상태 업데이트 최적화

   - Duplicate filtering based on ticket metadata
   - Pattern learning through task history tracking
   - Real-time status update optimization

3. **자동화 정확도 향상 | Automation Accuracy Improvement**
   - 그룹별 작업 패턴 학습 및 적용
   - 히스토리 기반 할당 정확도 개선
   - 상태 변경 의도 검증 시스템

   - Learning and applying group-specific work patterns
   - Assignment accuracy improvement based on history
   - Status change intention verification system

### 티켓 상태 자동 갱신 | Automatic Ticket Status Update

1. **회의 중 티켓 상태 감지 | In-meeting Ticket Status Detection**
   - 기존 티켓의 상태 변경 사항 자동 인식
   - 예시 시나리오:

   - Automatic recognition of existing ticket status changes
   - Example scenarios:
     ```
     "백엔드 API 문서화 작업을 현재 진행하고 있습니다." 
     → 해당 티켓 상태 'TODO' → 'IN_PROGRESS' 자동 갱신

     "Backend API documentation work is currently in progress."
     → Auto-update ticket status 'TODO' → 'IN_PROGRESS'
     
     "프론트엔드 로그인 페이지 구현이 완료되었습니다." 
     → 해당 티켓 상태 'IN_PROGRESS' → 'DONE' 자동 갱신

     "Frontend login page implementation has been completed."
     → Auto-update ticket status 'IN_PROGRESS' → 'DONE'
     ```

2. **상태 변경 프로세스 | Status Change Process**
   - 회의 내용에서 기존 티켓 제목과 매칭되는 키워드 추출
   - 문맥 기반 상태 변경 의도 파악
   - Prisma를 통한 티켓 상태 업데이트
   - 변경 이력 추적 및 로깅

   - Extract keywords matching existing ticket titles from meeting content
   - Context-based status change intention analysis
   - Ticket status update through Prisma
   - Change history tracking and logging

3. **정확도 향상 방안 | Accuracy Improvement Measures**
   - 유사도 기반 티켓 매칭 (제목 완전 일치가 아닌 경우 대응)
   - 상태 변경 의도 명확성 검증
   - 변경 전 현재 상태 확인 (잘못된 상태 전이 방지)

   - Similarity-based ticket matching (handling non-exact title matches)
   - Status change intention clarity verification
   - Current status verification before changes (preventing incorrect state transitions)

# 회의 분석 파이프라인 | Meeting Analysis Pipeline

### 개요 | Overview
PySpark와 Kafka를 활용하여 실시간 회의 데이터를 분석하고, 조직의 의사결정 패턴과 생산성을 측정하는 시스템입니다.

A system that analyzes real-time meeting data using PySpark and Kafka to measure organizational decision-making patterns and productivity.

#### 왜 Spark와 Kafka인가? | Why Spark and Kafka?
Kafka와 Spark는 대규모 데이터 처리를 위한 상호보완적인 분산 시스템입니다. Kafka는 데이터를 여러 파티션으로 나누어 안전하게 보관하고, Spark는 이 데이터를 병렬로 빠르게 분석합니다. 

시스템 장애가 발생하더라도 Kafka에 데이터가 보관되어 있어 Spark가 자동으로 재처리할 수 있으며, 데이터가 늘어나면 서버를 추가하여 쉽게 확장할 수 있습니다. 우리 시스템에서는 이러한 특성을 활용해 수백 개의 회의실 데이터를 평균 2-3초 만에 처리합니다.

Kafka and Spark are complementary distributed systems for large-scale data processing. Kafka safely stores data across multiple partitions, while Spark quickly analyzes this data in parallel.

Even if system failures occur, data is preserved in Kafka allowing Spark to automatically reprocess it, and the system can easily scale by adding servers as data grows. Using these characteristics, our system processes hundreds of meeting room data in an average of 2-3 seconds.

### 데이터 수집 및 처리 | Data Collection and Processing
1. **실시간 데이터 소스 | Real-time Data Sources** (Kafka Topics)
   - `transcription.completed`: 음성 인식 결과 | Voice recognition results
   - `ticket.created`: 생성된 작업 티켓 | Created work tickets
   - `ticket.updated`: 상태 변경된 티켓 | Status updated tickets
   - `analytics.ticket.metrics`: 티켓 분석 메트릭스 | Ticket analysis metrics
   - `analytics.trends.group.{groupId}`: 그룹별 트렌드 분석 | Group-specific trend analysis

2. **Spark Streaming 분석 | Spark Streaming Analysis**
   - 1분 간격의 윈도우 기반 실시간 처리 | Real-time processing with 1-minute window intervals
   - 7일 단위 트렌드 분석 | 7-day trend analysis
   - 그룹별 독립적인 메트릭스 산출 | Independent metrics calculation per group

### 분석 메트릭스 구조 | Analysis Metrics Structure

1. **티켓 분석 메트릭스 | Ticket Analysis Metrics** (`analytics.ticket.metrics`)
   ```json
   {
       "window": {
           "start": "2024-03-20T10:00:00",
           "end": "2024-03-20T10:01:00"
       },
       "meetingId": 123,
       "actionableItemsCount": 5,    // 실행 가능한 작업 수 | Number of actionable items
       "statusUpdatesCount": 8,      // 상태 업데이트 수 | Number of status updates
       "blockersMentioned": 2        // 블로커 언급 횟수 | Number of blockers mentioned
   }
   ```

2. **회의 생산성 점수 | Meeting Productivity Score**
   ```json
   {
       "window": {
           "start": "2024-03-20T10:00:00",
           "end": "2024-03-20T10:01:00"
       },
       "meetingId": 123,
       "productivity_score": 0.85,    // 생산성 점수 (0-1) | Productivity score (0-1)
       "ticket_count": 10,           // 총 티켓 수 | Total ticket count
       "actionable_tickets": 7       // 실행 가능한 티켓 수 | Number of actionable tickets
   }
   ```

3. **그룹별 트렌드 분석 | Group Trend Analysis** (`analytics.trends.group.{groupId}`)
   ```json
   {
       "period": {
           "start": "2024-03-18",
           "end": "2024-03-24"
       },
       "avg_productivity": 0.75,      // 평균 생산성 점수 | Average productivity score
       "avg_actionable_items": 12.5,  // 평균 실행 가능 작업 수 | Average actionable items
       "avg_status_updates": 15.3,    // 평균 상태 업데이트 수 | Average status updates
       "meeting_count": 8             // 기간 내 회의 수 | Meetings within period
   }
   ```

### 기술적 구현 | Technical Implementation

1. **데이터 파이프라인 구조 | Data Pipeline Structure**
   - Kafka → Spark Structured Streaming → Kafka/PostgreSQL
   - 실시간 처리: 1분 윈도우 단위 | Real-time processing: 1-minute window intervals
   - 트렌드 분석: 7일 단위 집계 | Trend analysis: 7-day aggregation

2. **주요 처리 단계 | Main Processing Steps**
   a. **데이터 수집 (Kafka) | Data Collection (Kafka)**
      - 음성 인식 결과 | Voice recognition results (transcription.completed)
      - 티켓 생성 이벤트 | Ticket creation events (ticket.created)
      - 티켓 업데이트 이벤트 | Ticket update events (ticket.updated)
      - 분석 메트릭스 | Analysis metrics (analytics.ticket.metrics)
      - 그룹별 트렌드 | Group trends (analytics.trends.groups)

   b. **실시간 처리 (Spark Streaming) | Real-time Processing (Spark Streaming)**
      - 티켓 메트릭스 계산 | Ticket metrics calculation (TicketAnalyzer)
      - 텍스트 분석 및 키워드 추출 | Text analysis and keyword extraction (MeetingAnalysisModel)
      - 생산성 점수 계산 | Productivity score calculation (MeetingMetricsAnalyzer)
      - 토픽 클러스터링 | Topic clustering

   c. **트렌드 분석 | Trend Analysis**
      - 그룹별 독립적 트렌드 분석 | Independent trend analysis per group
      - 실시간 메트릭스와 회의 메트릭스 조인 | Join real-time metrics with meeting metrics
      - 7일 단위 집계 및 평균 계산 | 7-day aggregation and average calculation

3. **성능 최적화 | Performance Optimization**
   - Watermark 설정: 2분 (실시간), 1일 (워크플로우) | Watermark settings: 2min (real-time), 1day (workflow)
   - 체크포인트 위치: `/tmp/checkpoints/` | Checkpoint location: `/tmp/checkpoints/`
   - 비동기 DB 저장 (PostgreSQL) | Asynchronous DB storage (PostgreSQL)
   - 스트림 처리 모드: "append" | Stream processing mode: "append"

4. **데이터 저장 | Data Storage**
   - PostgreSQL: 패턴 분석, 실시간 메트릭스, 생산성 패턴 | Pattern analysis, real-time metrics, productivity patterns
   - Kafka: 실시간 분석 결과, 그룹별 트렌드 | Real-time analysis results, group trends
   - 체크포인트: 스트림 처리 상태 보존 | Checkpoint: Stream processing state preservation

### 데이터 활용 | Data Utilization

1. **실시간 모니터링 | Real-time Monitoring**
   - 회의별 생산성 점수 추적 | Meeting-specific productivity score tracking
   - 티켓 생성 및 상태 변경 추이 | Ticket creation and status change trends
   - 블로커 발생 감지 | Blocker occurrence detection
   - 실행 가능한 작업 수 추적 | Actionable items count tracking

2. **트렌드 분석 | Trend Analysis**
   - 그룹별 생산성 추이 | Group productivity trends
   - 회의 효율성 비교 | Meeting efficiency comparison
   - 작업 처리 패턴 식별 | Task processing pattern identification
   - 시간대별 생산성 패턴 | Time-based productivity patterns

3. **인사이트 도출 | Insight Generation**
   - 최적 회의 시간대 추천 | Optimal meeting time recommendations
   - 생산성 저하 요인 분석 | Productivity decline factor analysis
   - 팀별 성과 비교 | Team performance comparison
   - 워크플로우 병목 지점 식별 | Workflow bottleneck identification

# 기술 스택 | Technology Stack

### Backend
#### Main Server
- TypeScript & Node.js
- Express.js (Web Framework)
- Prisma (ORM)
- PostgreSQL (Database)

#### Voice Processing Server
- FastAPI (Python Web Framework)
- Whisper (OpenAI Speech Recognition)
- OpenAI GPT API (Text Processing)

#### Data Processing
- Apache Kafka (Message Queue)
- Apache Spark & Scala
  - Spark Streaming (Real-time Data Processing)
  - Spark ML (Meeting Content Analysis)

#### API Documentation
- Swagger UI

### Frontend
- Next.js (React Framework)
- Firebase Authentication
- TailwindCSS
- React Query
- WebSocket (Real-time Communication)

### Development Environment
- Docker & Docker Compose
- ESLint & Prettier

### System Requirements
- Docker & Docker Compose (Required)
- Node.js 18+
- Python 3.11+
- Java Runtime Environment 11+
- GPU-based VM (Optional)

# 레거시 프로젝트 | Legacy Project

### 기존 AWS 프로젝트 플로우 | Previous AWS Project Flow
1. 클라이언트에서 오디오 스트림 시작 | Client Audio Stream Initiation
   - API Gateway를 통해 1분 단위로 오디오 데이터 전송
   - 티켓 상태 업데이트 요청 처리

   - Audio data transmission in 1-minute intervals through API Gateway
   - Ticket status update request processing

2. 오디오 처리 파이프라인 | Audio Processing Pipeline
   - Lambda를 통해 인증 및 메시지 큐 처리
   - MSK(Kafka)를 통한 오디오 데이터 스트리밍
   - 실시간 오디오 버퍼 처리 및 S3 저장

   - Authentication and message queue processing through Lambda
   - Audio data streaming through MSK(Kafka)
   - Real-time audio buffer processing and S3 storage

3. 음성 인식 및 텍스트 처리 | Speech Recognition and Text Processing
   - AWS Transcribe로 음성-텍스트 변환
   - 변환된 텍스트에서 주요 정보 추출
   - Bedrock을 통한 회의 내용 요약 및 작업 추출

   - Speech-to-text conversion using AWS Transcribe
   - Key information extraction from converted text
   - Meeting content summarization and task extraction through Bedrock

4. 티켓 관리 시스템 | Ticket Management System
   - 자동 티켓 생성 및 상태 업데이트
   - 회의 내용 기반 작업 할당
   - 실시간 칸반보드 동기화

   - Automatic ticket creation and status updates
   - Task assignment based on meeting content
   - Real-time Kanban board synchronization

### AWS 프로젝트 상세 구현 | AWS Project Detailed Implementation

#### 1. API Gateway에서 MSK로의 오디오 스트리밍 | Audio Streaming from API Gateway to MSK
API Gateway를 통해 클라이언트로부터 받은 오디오 버퍼를 MSK(Managed Kafka)로 전달하는 Lambda 함수를 구현했습니다. 이 함수는 base64로 인코딩된 오디오 데이터를 받아 Kafka 토픽으로 전송합니다.

I implemented a Lambda function that forwards audio buffers received from clients through API Gateway to MSK(Managed Kafka). This function receives base64 encoded audio data and sends it to Kafka topics.

**Lambda 함수 코드: | Lambda Function Code:**

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

#### 2. MSK 토픽 및 파티션 설정 | MSK Topic and Partition Configuration
EC2 인스턴스에서 Kafka 클러스터의 토픽과 파티션을 구성했습니다. 5개의 파티션을 생성하여 병렬 처리 능력을 향상시켰습니다.

I configured topics and partitions of the Kafka cluster on EC2 instances. I created 5 partitions to enhance parallel processing capabilities.

**토픽 생성 명령어:**

```kafka-cli
bin/kafka-topics.sh --create \
    --bootstrap-server b-1.vorikafka.fet16s.c12.kafka.us-east-1.amazonaws.com:9092 \
    --replication-factor 1 \
    --partitions 5 \
    --topic voriAudioStream
```

#### 3. MSK와 Lambda 이벤트 매핑 | MSK and Lambda Event Mapping
Lambda의 자동 동시성 처리 기능을 활용하여 단일 Lambda 함수로 MSK의 여러 파티션의 메시지를 효율적으로 처리했습니다.

I efficiently processed messages from multiple MSK partitions using a single Lambda function by utilizing Lambda's automatic concurrency handling feature.

**이벤트 매핑 명령어:**

```kafka-cli
aws lambda create-event-source-mapping \
    --function-name vori_fromMskToS3_partition0 \
    --event-source-arn arn:aws:kafka:us-east-1:823401933116:cluster/vorikafka/985aecc8-9c79-4031-ab8f-088222c95a6d-12 \
    --batch-size 1 \
    --starting-position LATEST \
    --topics voriAudioStream
```

#### 4. S3 저장 및 처리 완료 시그널링 | S3 Storage and Processing Completion Signaling
오디오 버퍼를 S3에 저장하고, 모든 데이터가 수신되면 end.txt 파일을 생성하는 Lambda 함수를 구현했습니다.

I implemented a Lambda function that stores audio buffers in S3 and creates an end.txt file when all data has been received.

**Lambda 함수 코드: | Lambda Function Code:**

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

#### 5. 주요 기술적 도전과 해결 | Major Technical Challenges and Solutions

![awsVori_VPCEndpoint_Lesson](https://raw.githubusercontent.com/nampaca123/Vori_Reborn/main/awsVori_VPCEndpoint_Lesson.png)

##### 문제 | Problem:
Lambda와 MSK가 VPC 내에 배포되었지만, S3와의 연결에 문제가 있었습니다. NAT 게이트웨이와 인터넷 게이트웨이를 구성했음에도 불구하고 S3와의 통신이 어려웠습니다.

I encountered connectivity issues between Lambda/MSK (deployed within VPC) and S3. Despite configuring NAT gateway and internet gateway, communication with S3 remained challenging.

##### 원인 | Cause:
Lambda와 MSK는 VPC 내부에 있었던 반면, S3는 외부에 위치해 있었습니다. AWS는 이와 같은 상황에서 NAT 게이트웨이나 인터넷 게이트웨이를 사용하는 것을 권장하지 않습니다. 이는 AWS의 서비스 아키텍처 설계 원칙과 맞지 않기 때문입니다. 그러므로 해당 방법은 IAM 권한 설정과 관련된 다양한 설정이 복잡해지는 단점이 있으며, 효율적인 네트워크 구성에는 적합하지 않습니다.

While Lambda and MSK were inside the VPC, S3 was located externally. AWS does not recommend using NAT gateway or internet gateway in such situations as it conflicts with AWS service architecture design principles. This approach complicates IAM permission settings and is not suitable for efficient network configuration.

##### 해결 방안 | Solution:
VPC Endpoint를 생성하여 Lambda와 S3 간에 AWS 내부에서 프라이빗 연결을 설정했습니다. 이를 통해 외부 인터넷 트래픽을 경유하지 않고도 안전하게 연결할 수 있었으며, 권한 설정도 간소화되었습니다. 또한, AWS 내에서 프라이빗 네트워크가 형성되어 보안이 강화되었습니다. 또한, NAT 게이트웨이를 사용하지 않음으로써 네트워크 트래픽에 따른 추가 비용을 절감할 수 있었습니다.

I created a VPC Endpoint to establish private connectivity between Lambda and S3 within AWS. This enabled secure connections without external internet traffic and simplified permission settings. Additionally, it enhanced security through private networking within AWS and reduced costs by eliminating the need for NAT gateway traffic.

##### 배운 점 | Lessons Learned:
이 문제를 통해 AWS 네트워크 구성에 대한 이해를 넓힐 수 있었으며, AWS의 권장 사항에 따라 인프라 구성 요소를 정렬하는 것이 얼마나 중요한지 배웠습니다. 비용 절감과 더불어 보안성과 관리 편의성을 모두 향상시킬 수 있었습니다.

Through this issue, I deepened my understanding of AWS network configuration and learned the importance of aligning infrastructure components with AWS recommendations. I was able to improve both security and manageability while reducing costs.

### 주요 마이그레이션 포인트 | Key Migration Points
- AWS MSK → Apache Kafka (로컬 | Local)
- AWS Transcribe → Whisper
- AWS Bedrock → Claude 3.5 API
- AWS S3 → 로컬 파일 시스템 | Local File System
- AWS Lambda → Express.js 엔드포인트 | Endpoints

## 설치 방법 | Installation Guide
(추후 작성 예정 | To be written)

## API 문서 | API Documentation
(추후 작성 예정 | To be written)

## 라이선스 | License
MIT License