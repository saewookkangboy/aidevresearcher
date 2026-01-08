/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * PostgreSQL 데이터베이스 연결 설정
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

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
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

// 연결 풀 종료 (애플리케이션 종료 시)
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('PostgreSQL 연결 풀이 종료되었습니다.');
};

// 데이터베이스 연결 확인
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 확인:', result.rows[0]);
    return true;
  } catch (error: any) {
    // 데이터베이스가 존재하지 않는 경우 친절한 메시지 제공
    if (error.code === '3D000') {
      console.error('데이터베이스 연결 실패:', error.message);
      console.error('\n💡 해결 방법:');
      console.error('  1. 데이터베이스 생성: npm run db:create');
      console.error('  2. 마이그레이션 실행: npm run migrate');
      console.error('  3. 또는 한 번에: npm run db:setup\n');
    } else {
      console.error('데이터베이스 연결 실패:', error);
    }
    return false;
  }
};

