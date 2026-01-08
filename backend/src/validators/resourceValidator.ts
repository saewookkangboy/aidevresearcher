/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 리소스 입력 검증 스키마 (Zod)
 */

import { z } from 'zod';

// ResourceType enum
export const ResourceTypeSchema = z.enum([
  'LIBRARY',
  'CLI_EXTENSION',
  'AGENT_SKILL',
  'VSCODE_EXT',
  'API',
  'STARTER_KIT',
]);

// SourceType enum
export const SourceTypeSchema = z.enum([
  'GITHUB',
  'OFFICIAL',
  'SOCIAL_X',
  'SOCIAL_THREADS',
  'API',
  'USER',
]);

// LinkStatus enum
export const LinkStatusSchema = z.enum([
  'active',
  'broken',
  'checking',
  'fixed',
]);

// Social Metrics 스키마
export const SocialMetricsSchema = z.object({
  likes: z.number().optional(),
  shares: z.number().optional(),
  comments: z.number().optional(),
  platform: z.enum(['X', 'THREADS', 'REDDIT']).optional(),
}).optional();

// Meta 스키마
export const MetaSchema = z.object({
  title: z.string().optional(),
  statusCode: z.number().optional(),
  contentType: z.string().optional(),
  lastFetchedAt: z.string().optional(),
}).optional();

// 리소스 생성 스키마
export const CreateResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '제목은 필수입니다').max(500, '제목은 500자 이하여야 합니다'),
  type: ResourceTypeSchema,
  description: z.string().min(0).max(5000, '설명은 5000자 이하여야 합니다'),
  platforms: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  command: z.string().optional(),
  url: z.string().url('올바른 URL 형식이어야 합니다'),
  stars: z.number().int().min(0).optional(),
  is_verified: z.boolean().default(false),
  source: z.string().min(1, '출처는 필수입니다'),
  source_type: SourceTypeSchema,
  link_status: LinkStatusSchema.default('checking'),
  social_metrics: SocialMetricsSchema,
  meta: MetaSchema,
});

// 리소스 업데이트 스키마 (모든 필드가 선택적)
export const UpdateResourceSchema = CreateResourceSchema.partial().extend({
  id: z.string().optional(),
  created_at: z.string().optional(),
});

// 쿼리 파라미터 검증 스키마
export const GetResourcesQuerySchema = z.object({
  type: ResourceTypeSchema.optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(1000)).default('100'),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0)).default('0'),
});

// 검색 쿼리 스키마
export const SearchResourcesQuerySchema = z.object({
  q: z.string().min(1).optional(),
  type: ResourceTypeSchema.optional(),
  platform: z.string().optional(),
});

// ID 파라미터 스키마
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID는 필수입니다'),
});

// 타입 추론
export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type GetResourcesQuery = z.infer<typeof GetResourcesQuerySchema>;
export type SearchResourcesQuery = z.infer<typeof SearchResourcesQuerySchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
