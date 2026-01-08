/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 사용자 상호작용 입력 검증 스키마
 */

import { z } from 'zod';

export const InteractionTypeSchema = z.enum([
  'view',
  'click',
  'copy',
  'install',
  'like',
  'share',
]);

export const CreateInteractionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  resource_id: z.string().min(1, '리소스 ID는 필수입니다'),
  interaction_type: InteractionTypeSchema,
  interaction_data: z.record(z.any()).optional(),
  search_query: z.string().optional(),
  role: z.string().optional(),
  session_id: z.string().optional(),
  user_agent: z.string().optional(),
  referrer: z.string().url().optional().or(z.literal('')),
});

export const ResourceIdParamSchema = z.object({
  resourceId: z.string().min(1, '리소스 ID는 필수입니다'),
});

export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>;
export type ResourceIdParam = z.infer<typeof ResourceIdParamSchema>;
