/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 개발 환경용 데이터베이스 생성 스크립트
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // postgres 데이터베이스에 연결 (기본 데이터베이스)
  const adminPool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: 'postgres', // 기본 데이터베이스에 연결
  });

  const dbName = process.env.PGDATABASE || 'vibe_coding_navigator';

  try {
    console.log(`🔄 데이터베이스 "${dbName}" 생성 중...`);

    // 데이터베이스 존재 여부 확인
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`ℹ️  데이터베이스 "${dbName}"이 이미 존재합니다.`);
    } else {
      // 데이터베이스 생성
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ 데이터베이스 "${dbName}" 생성 완료!`);
    }
  } catch (error: any) {
    console.error('❌ 데이터베이스 생성 오류:', error.message);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

createDatabase();
