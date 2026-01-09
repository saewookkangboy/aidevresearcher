/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Resources API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { apiLimiter, strictLimiter, searchLimiter } from '../middleware/rateLimiter';
import {
  CreateResourceSchema,
  UpdateResourceSchema,
  GetResourcesQuerySchema,
  SearchResourcesQuerySchema,
  IdParamSchema,
} from '../validators/resourceValidator';

const router = Router();

// 모든 리소스 조회
router.get('/', apiLimiter, validateQuery(GetResourcesQuerySchema), async (req: Request, res: Response) => {
  try {
    const { type, limit = '50', offset = '0' } = req.query as { type?: string; limit?: string; offset?: string };
    
    let sqlQuery = 'SELECT * FROM resources';
    const params: (string | number)[] = [];
    let paramIndex = 1;
    
    if (type) {
      sqlQuery += ` WHERE type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));
    
    const result = await pool.query(sqlQuery, params);
    logger.info('Resources fetched', { count: result.rows.length, type, limit, offset });
    res.json(result.rows);
  } catch (error) {
    logger.error('리소스 조회 오류', { error, query: req.query });
    throw error; // 에러 핸들러로 전달
  }
});

// 특정 리소스 조회
router.get('/:id', apiLimiter, validateParams(IdParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      logger.warn('Resource not found', { id });
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }
    
    logger.info('Resource fetched', { id });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('리소스 조회 오류', { error, id: req.params.id });
    throw error;
  }
});

// 리소스 생성
router.post('/', strictLimiter, validateBody(CreateResourceSchema), async (req: Request, res: Response) => {
  try {
    const {
      id,
      title,
      type,
      description,
      platforms = [],
      tags = [],
      command,
      url,
      stars,
      is_verified = false,
      source,
      source_type,
      link_status = 'checking',
      social_metrics,
      meta,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO resources (
        id, title, type, description, platforms, tags, command, url,
        stars, is_verified, source, source_type, link_status, social_metrics, meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        id || `resource_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        title,
        type,
        description,
        platforms,
        tags,
        command,
        url,
        stars ?? null,
        is_verified,
        source,
        source_type,
        link_status,
        social_metrics ? JSON.stringify(social_metrics) : null,
        meta ? JSON.stringify(meta) : null,
      ]
    );

    logger.info('Resource created', { id: result.rows[0].id, title, type });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('리소스 생성 오류', { error, body: req.body });
    throw error;
  }
});

// 리소스 업데이트
router.put('/:id', apiLimiter, validateParams(IdParamSchema), validateBody(UpdateResourceSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body as Record<string, unknown>;
    
    // 업데이트할 필드만 동적으로 구성
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        if (key === 'social_metrics' || key === 'meta') {
          values.push(updates[key] ? JSON.stringify(updates[key]) : null);
        } else {
          values.push(updates[key] as string | number | boolean | null);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      logger.warn('No fields to update', { id });
      return res.status(400).json({ error: '업데이트할 필드가 없습니다.' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sqlQuery = `UPDATE resources SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(sqlQuery, values);

    if (result.rows.length === 0) {
      logger.warn('Resource not found for update', { id });
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }

    logger.info('Resource updated', { id, updatedFields: Object.keys(updates) });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('리소스 업데이트 오류', { error, id: req.params.id, body: req.body });
    throw error;
  }
});

// 리소스 삭제
router.delete('/:id', strictLimiter, validateParams(IdParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      logger.warn('Resource not found for deletion', { id });
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }

    logger.info('Resource deleted', { id });
    res.json({ message: '리소스가 삭제되었습니다.', id });
  } catch (error) {
    logger.error('리소스 삭제 오류', { error, id: req.params.id });
    throw error;
  }
});

// 리소스 검색
router.get('/search', searchLimiter, validateQuery(SearchResourcesQuerySchema), async (req: Request, res: Response) => {
  try {
    const { q, type, platform } = req.query as { q?: string; type?: string; platform?: string };
    
    let sqlQuery = 'SELECT * FROM resources WHERE 1=1';
    const params: string[] = [];
    let paramIndex = 1;

    if (q) {
      sqlQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (type) {
      sqlQuery += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (platform) {
      sqlQuery += ` AND $${paramIndex} = ANY(platforms)`;
      params.push(platform);
      paramIndex++;
    }

    sqlQuery += ' ORDER BY created_at DESC';
    
    const result = await pool.query(sqlQuery, params);
    logger.info('Resources searched', { query: q, type, platform, count: result.rows.length });
    res.json(result.rows);
  } catch (error) {
    logger.error('리소스 검색 오류', { error, query: req.query });
    throw error;
  }
});

export default router;

