# Node.js 18 버전을 기반으로 하는 이미지 사용
FROM node:18-slim

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로젝트 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 서버 실행 포트 설정
EXPOSE 3000

# 서버 실행 명령
CMD ["npm", "start"] 