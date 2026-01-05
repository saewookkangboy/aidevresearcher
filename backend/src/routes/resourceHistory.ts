/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Resource History API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// 리소스 이력 기록
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      resource_id,
      action,
      changes,
      source,
      metadata,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO resource_history (
        id, resource_id, action, changes, source, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        id || `history_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        resource_id,
        action,
        changes ? JSON.stringify(changes) : null,
        source,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('리소스 이력 기록 오류:', error);
    res.status(500).json({ error: '리소스 이력을 기록하는 중 오류가 발생했습니다.' });
  }
});

// 리소스별 이력 조회
router.get('/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const result = await pool.query(
      'SELECT * FROM resource_history WHERE resource_id = $1 ORDER BY timestamp DESC',
      [resourceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('리소스 이력 조회 오류:', error);
    res.status(500).json({ error: '리소스 이력을 조회하는 중 오류가 발생했습니다.' });
  }
});

export default router;

