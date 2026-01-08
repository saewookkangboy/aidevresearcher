/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 중앙 집중식 에러 처리 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * 커스텀 에러 클래스
 */
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

/**
 * 에러 처리 미들웨어
 */
export function errorHandler(
  err: AppError | Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod 검증 에러
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      errors: err.errors,
      path: req.path,
      method: req.method,
    });
    return res.status(400).json({
      error: '입력 검증 실패',
      details: err.errors.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // PostgreSQL 에러
  if (err && typeof err === 'object' && 'code' in err) {
    const pgError = err as any;
    
    // 중복 키 에러
    if (pgError.code === '23505') {
      logger.warn('Duplicate key error', { code: pgError.code, detail: pgError.detail });
      return res.status(409).json({
        error: '이미 존재하는 리소스입니다.',
      });
    }

    // 외래 키 제약 위반
    if (pgError.code === '23503') {
      logger.warn('Foreign key constraint error', { code: pgError.code, detail: pgError.detail });
      return res.status(400).json({
        error: '관련된 리소스를 찾을 수 없습니다.',
      });
    }

    // NOT NULL 제약 위반
    if (pgError.code === '23502') {
      logger.warn('Not null constraint error', { code: pgError.code, detail: pgError.detail });
      return res.status(400).json({
        error: '필수 필드가 누락되었습니다.',
      });
    }
  }

  // 커스텀 에러
  if (err instanceof CustomError && err.isOperational) {
    logger.error('Operational error', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // 예상치 못한 에러
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // 프로덕션 환경에서는 상세한 에러 정보 숨김
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = (err as AppError).statusCode || 500;
  
  res.status(statusCode).json({
    error: isDevelopment ? err.message : '내부 서버 오류가 발생했습니다.',
    ...(isDevelopment && { stack: err.stack }),
  });
}

/**
 * 404 핸들러
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path,
  });
}
