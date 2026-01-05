/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Express.js 백엔드 서버
 * Railway PostgreSQL과 연결
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import resourcesRouter from './routes/resources';
import interactionsRouter from './routes/interactions';
import resourceHistoryRouter from './routes/resourceHistory';
import recommendationsRouter from './routes/recommendations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스 체크
app.get('/health', async (req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API 라우터
app.use('/api/resources', resourcesRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/resource-history', resourceHistoryRouter);
app.use('/api/recommendations', recommendationsRouter);

// 루트 엔드포인트
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Vibe Coding Navigator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      resources: '/api/resources',
      interactions: '/api/interactions',
      resourceHistory: '/api/resource-history',
      recommendations: '/api/recommendations',
    },
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📍 환경: ${process.env.NODE_ENV || 'development'}`);
  
  // 데이터베이스 연결 테스트
  const connected = await testConnection();
  if (connected) {
    console.log('✅ PostgreSQL 데이터베이스 연결 성공');
  } else {
    console.warn('⚠️  PostgreSQL 데이터베이스 연결 실패');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

export default app;

