/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * Resources API 라우터
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// 모든 리소스 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, limit = '100', offset = '0' } = req.query;
    
    let query = 'SELECT * FROM resources';
    const params: any[] = [];
    
    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('리소스 조회 오류:', error);
    res.status(500).json({ error: '리소스를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 특정 리소스 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('리소스 조회 오류:', error);
    res.status(500).json({ error: '리소스를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 리소스 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      title,
      type,
      description,
      platforms,
      tags,
      command,
      url,
      stars,
      is_verified,
      source,
      source_type,
      link_status,
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
        id,
        title,
        type,
        description,
        platforms || [],
        tags || [],
        command,
        url,
        stars || null,
        is_verified || false,
        source,
        source_type,
        link_status || 'checking',
        social_metrics ? JSON.stringify(social_metrics) : null,
        meta ? JSON.stringify(meta) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('리소스 생성 오류:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: '이미 존재하는 리소스입니다.' });
    }
    res.status(500).json({ error: '리소스를 생성하는 중 오류가 발생했습니다.' });
  }
});

// 리소스 업데이트
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 업데이트할 필드만 동적으로 구성
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        if (key === 'social_metrics' || key === 'meta') {
          values.push(updates[key] ? JSON.stringify(updates[key]) : null);
        } else {
          values.push(updates[key]);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: '업데이트할 필드가 없습니다.' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE resources SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('리소스 업데이트 오류:', error);
    res.status(500).json({ error: '리소스를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 리소스 삭제
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '리소스를 찾을 수 없습니다.' });
    }

    res.json({ message: '리소스가 삭제되었습니다.', id });
  } catch (error) {
    console.error('리소스 삭제 오류:', error);
    res.status(500).json({ error: '리소스를 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 리소스 검색
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, type, platform } = req.query;
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (platform) {
      query += ` AND $${paramIndex} = ANY(platforms)`;
      params.push(platform);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('리소스 검색 오류:', error);
    res.status(500).json({ error: '리소스를 검색하는 중 오류가 발생했습니다.' });
  }
});

export default router;

