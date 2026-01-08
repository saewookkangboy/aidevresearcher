/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Zod 검증 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * 요청 본문 검증 미들웨어
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', { errors: error.errors, body: req.body });
        return res.status(400).json({
          error: '입력 검증 실패',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * 쿼리 파라미터 검증 미들웨어
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Query validation error', { errors: error.errors, query: req.query });
        return res.status(400).json({
          error: '쿼리 파라미터 검증 실패',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * URL 파라미터 검증 미들웨어
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Params validation error', { errors: error.errors, params: req.params });
        return res.status(400).json({
          error: 'URL 파라미터 검증 실패',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}
