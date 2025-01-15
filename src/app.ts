import express from 'express';
import cors from 'cors';
import { morganMW } from './middlewares/logger';
import { errorHandlerMiddleware } from './middlewares/errorHandler';
import meetingRoutes from './routes/meetingRoutes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import groupRoutes from './routes/groupRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

export default app;