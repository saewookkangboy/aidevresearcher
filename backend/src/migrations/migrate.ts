/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 데이터베이스 마이그레이션 스크립트
 * Railway PostgreSQL에 스키마를 생성합니다.
 */

import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

async function migrate() {
  try {
    console.log('🔄 데이터베이스 마이그레이션을 시작합니다...');

    // 스키마 파일 읽기
    if (!fs.existsSync(SCHEMA_FILE)) {
      console.error('❌ schema.sql 파일을 찾을 수 없습니다.');
      process.exit(1);
    }

    const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');

    // 스키마 실행
    await pool.query(schema);

    console.log('✅ 데이터베이스 마이그레이션이 완료되었습니다.');
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  migrate();
}

export { migrate };

