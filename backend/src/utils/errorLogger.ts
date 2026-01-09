/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 프론트엔드 에러 로깅 유틸리티 (선택사항)
 * 백엔드 API로 에러를 전송할 수 있음
 * 
 * 주의: 이 파일은 프론트엔드에서 사용하기 위한 파일입니다.
 * 백엔드 환경에서는 기본적으로 콘솔에만 로깅합니다.
 */

export interface ErrorLog {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  context?: Record<string, any>;
}

// Node.js 환경인지 브라우저 환경인지 확인
const isBrowser = typeof (globalThis as any).window !== 'undefined' && typeof (globalThis as any).navigator !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

const API_BASE_URL = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:8000';

export async function logErrorToBackend(error: Error, context?: Record<string, any>): Promise<void> {
  if (isDevelopment || !isBrowser) {
    // 개발 환경이거나 Node.js 환경에서는 콘솔에만 출력
    console.error('Error logged:', error, context);
    return;
  }

  try {
    const win = (globalThis as any).window;
    const nav = (globalThis as any).navigator;
    
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: win?.location?.href || '',
      userAgent: nav?.userAgent || '',
      context,
    };

    await fetch(`${API_BASE_URL}/api/errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });
  } catch (err) {
    // 에러 로깅 실패는 무시 (무한 루프 방지)
    console.error('Failed to log error to backend:', err);
  }
}
