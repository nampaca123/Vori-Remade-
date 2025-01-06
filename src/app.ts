import express from 'express';
import cors from 'cors';
import { morganMW } from './middlewares/logger';
import { errorHandlerMiddleware } from './middlewares/errorHandler';
import meetingRoutes from './routes/meetingRoutes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morganMW);

// 라우터
app.use('/api/meetings', meetingRoutes);
// 기본 라우트
app.get('/', (req, res) => {
  res.send('VORI Backend Server');
});

// 에러 핸들링 미들웨어
app.use(errorHandlerMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export default app;
