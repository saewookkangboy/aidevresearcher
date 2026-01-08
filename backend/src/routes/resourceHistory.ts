/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Resource History API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { validateBody, validateParams } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import { CreateResourceHistorySchema, ResourceIdParamSchema } from '../validators/resourceHistoryValidator';

const router = Router();

// 리소스 이력 기록
router.post('/', apiLimiter, validateBody(CreateResourceHistorySchema), async (req: Request, res: Response) => {
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

    logger.info('Resource history recorded', { resource_id, action });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('리소스 이력 기록 오류', { error, body: req.body });
    throw error;
  }
});

// 리소스별 이력 조회
router.get('/:resourceId', apiLimiter, validateParams(ResourceIdParamSchema), async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const result = await pool.query(
      'SELECT * FROM resource_history WHERE resource_id = $1 ORDER BY timestamp DESC',
      [resourceId]
    );
    logger.info('Resource history fetched', { resourceId, count: result.rows.length });
    res.json(result.rows);
  } catch (error) {
    logger.error('리소스 이력 조회 오류', { error, resourceId: req.params.resourceId });
    throw error;
  }
});

export default router;

