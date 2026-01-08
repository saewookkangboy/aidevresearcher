/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 프론트엔드 에러 로깅 유틸리티 (선택사항)
 * 백엔드 API로 에러를 전송할 수 있음
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function logErrorToBackend(error: Error, context?: Record<string, any>): Promise<void> {
  if (!import.meta.env.PROD) {
    // 개발 환경에서는 콘솔에만 출력
    console.error('Error logged:', error, context);
    return;
  }

  try {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
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
