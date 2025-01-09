import express from 'express';
import cors from 'cors';
import { morganMW } from './middlewares/logger';
import { errorHandlerMiddleware } from './middlewares/errorHandler';
import meetingRoutes from './routes/meetingRoutes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import groupRoutes from './routes/groupRoutes';
import userRoutes from './routes/userRoutes';
import { AudioProcessor } from './services/core/audioProcessor';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morganMW);

// 라우터
app.use('/api/meetings', meetingRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
// 기본 라우트
app.get('/', (req, res) => {
  res.send('VORI Backend Server');
});

// 에러 핸들링 미들웨어
app.use(errorHandlerMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const audioProcessor = AudioProcessor.getInstance();

const initApp = async () => {
  await audioProcessor.startProcessing();
}

initApp().catch(console.error);

// 애플리케이션 종료 시 정리
process.on('SIGTERM', async () => {
  await audioProcessor.stop();
  // ... 다른 정리 작업들
});

export default app;
