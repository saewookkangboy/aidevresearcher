/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * User Interactions API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// 상호작용 기록
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      user_id,
      resource_id,
      interaction_type,
      interaction_data,
      search_query,
      role,
      session_id,
      user_agent,
      referrer,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO user_interactions (
        id, user_id, resource_id, interaction_type, interaction_data,
        search_query, role, session_id, user_agent, referrer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id || `interaction_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        user_id,
        resource_id,
        interaction_type,
        interaction_data ? JSON.stringify(interaction_data) : null,
        search_query,
        role,
        session_id,
        user_agent,
        referrer,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('상호작용 기록 오류:', error);
    res.status(500).json({ error: '상호작용을 기록하는 중 오류가 발생했습니다.' });
  }
});

// 리소스별 상호작용 조회
router.get('/resource/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const result = await pool.query(
      'SELECT * FROM user_interactions WHERE resource_id = $1 ORDER BY timestamp DESC',
      [resourceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('상호작용 조회 오류:', error);
    res.status(500).json({ error: '상호작용을 조회하는 중 오류가 발생했습니다.' });
  }
});

export default router;

