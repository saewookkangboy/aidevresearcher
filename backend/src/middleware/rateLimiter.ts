/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Rate Limiting 미들웨어
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * 일반 API Rate Limiter
 * 15분에 100번 요청 허용
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100번 요청
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  },
});

/**
 * 엄격한 Rate Limiter
 * 15분에 10번 요청 허용 (로그인, 리소스 생성 등)
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 10번 요청
  message: {
    error: '요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: '요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.',
    });
  },
});

/**
 * 검색 Rate Limiter
 * 1분에 30번 요청 허용
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // 최대 30번 요청
  message: {
    error: '검색 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: '검색 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.',
    });
  },
});
