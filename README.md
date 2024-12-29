# VORI - Voice to Report (Remaster)

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

### 주요 마이그레이션 포인트
- AWS MSK → Apache Kafka (로컬)
- AWS Transcribe → Whisper
- AWS Bedrock → OpenAI GPT API
- AWS S3 → 로컬 파일 시스템
- AWS Lambda → Express.js 엔드포인트

## 기술 스택

### 백엔드
- TypeScript
- Node.js + Express.js
- Prisma (ORM)
- PostgreSQL
- Apache Kafka
- Whisper (OpenAI) - 음성인식
- OpenAI GPT API - 텍스트 처리
- Swagger UI - API 문서화

### 프론트엔드
- Next.js (React 기반 프레임워크)
- Firebase Authentication
- TailwindCSS
- React Query
- WebSocket (실시간 오디오 스트리밍)

### 개발 도구
- Docker & Docker Compose
- ESLint & Prettier
- Jest (테스팅)

## 주요 기능
- 실시간 음성 스트리밍 및 텍스트 변환
- 칸반보드 통합
- 자동 작업 생성 및 상태 업데이트
- 회의록 자동 생성

## 시스템 요구사항
- Docker & Docker Compose (필수)
- Node.js 18+ (개발용)
- CUDA 지원 GPU (Whisper 가속화용, 선택사항)

## 설치 방법
(추후 작성 예정)

## 로컬 개발 환경 설정
### Docker 컨테이너 구성
- PostgreSQL (데이터베이스)
- Apache Kafka (메시지 큐)
- Zookeeper (Kafka 클러스터 관리)

## API 문서
(추후 작성 예정)

## 라이선스
MIT License
