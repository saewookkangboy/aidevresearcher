/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Recommendations API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// 추천 로그 기록
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      user_id,
      session_id,
      query,
      role,
      recommended_resources,
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
        recommended_resources || [],
        recommendation_scores ? JSON.stringify(recommendation_scores) : null,
        model_id,
        context ? JSON.stringify(context) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('추천 로그 기록 오류:', error);
    res.status(500).json({ error: '추천 로그를 기록하는 중 오류가 발생했습니다.' });
  }
});

export default router;

