import express from 'express';
import cors from 'cors';
import { morganMW } from './middleware/logger';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import meetingRoutes from './routes/meetingRoutes';
import ticketRoutes from './routes/ticketRoutes';

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morganMW);

// 라우터
app.use('/api/meetings', meetingRoutes);
app.use('/api/tickets', ticketRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('VORI Backend Server');
});

// 에러 핸들링 미들웨어
app.use(errorHandlerMiddleware);

export default app;
