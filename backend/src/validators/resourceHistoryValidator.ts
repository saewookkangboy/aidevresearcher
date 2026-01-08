/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 리소스 이력 입력 검증 스키마
 */

import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'created',
  'updated',
  'deleted',
  'verified',
  'broken',
  'fixed',
]);

export const CreateResourceHistorySchema = z.object({
  id: z.string().optional(),
  resource_id: z.string().min(1, '리소스 ID는 필수입니다'),
  action: ActionTypeSchema,
  changes: z.object({
    before: z.record(z.any()).optional(),
    after: z.record(z.any()).optional(),
  }).optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ResourceIdParamSchema = z.object({
  resourceId: z.string().min(1, '리소스 ID는 필수입니다'),
});

export type CreateResourceHistoryInput = z.infer<typeof CreateResourceHistorySchema>;
export type ResourceIdParam = z.infer<typeof ResourceIdParamSchema>;
