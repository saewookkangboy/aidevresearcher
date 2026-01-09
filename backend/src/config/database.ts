/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * PostgreSQL 데이터베이스 연결 설정
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Railway PostgreSQL 연결 정보
const getDatabaseConfig = (): PoolConfig => {
  // Railway는 DATABASE_URL 환경 변수를 자동으로 제공합니다
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // DATABASE_URL 형식: postgresql://user:password@host:port/database
    return {
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // 개별 환경 변수로 구성 (개발 환경용)
  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'vibe_coding_navigator',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};

// PostgreSQL 연결 풀 생성
export const pool = new Pool(getDatabaseConfig());

// 연결 테스트
pool.on('connect', () => {
  logger.info('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err: Error) => {
  logger.error('❌ PostgreSQL 연결 오류:', { error: err });
  process.exit(-1);
});

// 연결 풀 종료 (애플리케이션 종료 시)
export const closePool = async (): Promise<void> => {
  await pool.end();
  logger.info('PostgreSQL 연결 풀이 종료되었습니다.');
};

// 데이터베이스 연결 확인
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('데이터베이스 연결 확인', { timestamp: result.rows[0] });
    return true;
  } catch (error: unknown) {
    // 데이터베이스가 존재하지 않는 경우 친절한 메시지 제공
    const dbError = error as { code?: string; message?: string };
    if (dbError.code === '3D000') {
      logger.error('데이터베이스 연결 실패', {
        code: dbError.code,
        message: dbError.message,
        hint: '데이터베이스가 존재하지 않습니다. npm run db:setup을 실행하세요.',
      });
    } else {
      logger.error('데이터베이스 연결 실패', { error });
    }
    return false;
  }
};

