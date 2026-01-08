/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Winston 로깅 설정
 */

import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 개발 환경용 콘솔 포맷
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, stack } = info;
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// 로거 생성
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: logFormat,
  defaultMeta: { service: 'vibe-coding-navigator-backend' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  // Promise 거부 처리
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// 개발 환경에서는 콘솔에도 출력
if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 프로덕션 환경에서도 콘솔 출력 (Railway 등 서비스에서 확인 가능하도록)
if (!isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
