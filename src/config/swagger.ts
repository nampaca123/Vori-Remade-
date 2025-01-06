import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VORI API Documentation',
      version: '1.0.0',
      description: '음성 회의 기록 및 티켓 관리 API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // routes 디렉토리 내의 모든 TypeScript 파일
};

export const specs = swaggerJsdoc(options); 