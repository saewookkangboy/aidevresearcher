/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 추천 로그 입력 검증 스키마
 */

import { z } from 'zod';

export const CreateRecommendationSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  query: z.string().min(1, '쿼리는 필수입니다'),
  role: z.string().optional(),
  recommended_resources: z.array(z.string()).default([]),
  recommendation_scores: z.record(z.number()).optional(),
  model_id: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export type CreateRecommendationInput = z.infer<typeof CreateRecommendationSchema>;
