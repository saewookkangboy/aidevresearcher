/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Recommendations API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { validateBody } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import { CreateRecommendationSchema } from '../validators/recommendationValidator';

const router = Router();

// 추천 로그 기록
router.post('/', apiLimiter, validateBody(CreateRecommendationSchema), async (req: Request, res: Response) => {
  try {
    const {
      id,
      user_id,
      session_id,
      query,
      role,
      recommended_resources = [],
      recommendation_scores,
      model_id,
      context,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO recommendation_log (
        id, user_id, session_id, query, role,
        recommended_resources, recommendation_scores, model_id, context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        user_id,
        session_id,
        query,
        role,
        recommended_resources,
        recommendation_scores ? JSON.stringify(recommendation_scores) : null,
        model_id,
        context ? JSON.stringify(context) : null,
      ]
    );

    logger.info('Recommendation logged', { query, role, resourceCount: recommended_resources.length });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('추천 로그 기록 오류', { error, body: req.body });
    throw error;
  }
});

export default router;

