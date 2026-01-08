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
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import resourcesRouter from './routes/resources';
import interactionsRouter from './routes/interactions';
import resourceHistoryRouter from './routes/resourceHistory';
import recommendationsRouter from './routes/recommendations';
import { ResourceCollector } from './services/collector';

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

// 404 핸들러 (모든 라우트 이후에 위치해야 함)
app.use(notFoundHandler);

// 에러 처리 미들웨어 (모든 미들웨어와 라우트 이후에 위치해야 함)
app.use(errorHandler);

// 서버 시작
const server = app.listen(PORT, async () => {
  logger.info(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
  
  // 데이터베이스 연결 테스트
  const connected = await testConnection();
  if (connected) {
    logger.info('✅ PostgreSQL 데이터베이스 연결 성공');
    
    // 자동 리소스 수집 시작 (백그라운드에서 실행, 에러가 발생해도 서버는 계속 실행)
    try {
      const collector = new ResourceCollector();
      collector.startAutoCollection();
      logger.info('✅ 자동 리소스 수집이 시작되었습니다.');
    } catch (error) {
      logger.warn('⚠️  자동 리소스 수집 시작 실패 (서버는 정상 작동)', { error });
    }
  } else {
    logger.warn('⚠️  PostgreSQL 데이터베이스 연결 실패');
    logger.warn('💡 개발 환경에서 데이터베이스를 설정하려면: npm run db:setup');
    logger.warn('⚠️  API는 작동하지만 데이터베이스 기능은 사용할 수 없습니다.');
  }
});

// 포트 충돌 에러 처리
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ 포트 ${PORT}가 이미 사용 중입니다. 다른 포트를 사용하거나 해당 포트를 사용하는 프로세스를 종료하세요.`, {
      port: PORT,
      error: error.message,
      hint: `다음 명령어로 포트를 사용하는 프로세스를 확인할 수 있습니다: lsof -ti:${PORT}`,
    });
    process.exit(1);
  } else {
    logger.error('서버 시작 오류', { error });
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

// 처리되지 않은 예외 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

export default app;

