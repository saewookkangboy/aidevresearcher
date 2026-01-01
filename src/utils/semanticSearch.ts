/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource } from './types';

/**
 * 자연어 쿼리를 분석하여 리소스와의 관련도 점수를 계산
 */
export function calculateRelevanceScore(resource: Resource, query: string): number {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  let score = 0;

  // 1. 제목 매칭 (가장 높은 가중치)
  const titleLower = resource.title.toLowerCase();
  if (titleLower === lowerQuery) {
    score += 100; // 완전 일치
  } else if (titleLower.includes(lowerQuery)) {
    score += 50; // 부분 일치
  } else {
    // 단어별 매칭
    const titleWords = titleLower.split(/\s+/);
    queryWords.forEach(qw => {
      if (titleWords.some(tw => tw.includes(qw) || qw.includes(tw))) {
        score += 20;
      }
    });
  }

  // 2. 설명 매칭
  const descLower = (resource.description || '').toLowerCase();
  if (descLower.includes(lowerQuery)) {
    score += 30;
  } else {
    queryWords.forEach(qw => {
      if (descLower.includes(qw)) {
        score += 10;
      }
    });
  }

  // 3. 태그 매칭
  resource.tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    if (tagLower === lowerQuery) {
      score += 40;
    } else if (tagLower.includes(lowerQuery) || lowerQuery.includes(tagLower)) {
      score += 25;
    } else {
      queryWords.forEach(qw => {
        if (tagLower.includes(qw) || qw.includes(tagLower)) {
          score += 15;
        }
      });
    }
  });

  // 4. 플랫폼 매칭
  resource.platforms.forEach(platform => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes(lowerQuery) || lowerQuery.includes(platformLower)) {
      score += 20;
    } else {
      queryWords.forEach(qw => {
        if (platformLower.includes(qw)) {
          score += 10;
        }
      });
    }
  });

  // 5. 타입 매칭 (의미 기반)
  const typeKeywords: Record<string, string[]> = {
    'VSCODE_EXT': ['vscode', 'visual studio code', '에디터', 'editor', 'extension', '확장', 'marketplace', 'marketplace'],
    'CLI_EXTENSION': ['cli', 'command', '터미널', 'terminal', 'mcp', 'server', 'gemini', '명령줄'],
    'AGENT_SKILL': ['agent', 'skill', '스킬', '능력', '모듈', 'module', '작업', 'task'],
    'LIBRARY': ['library', '라이브러리', 'framework', '프레임워크', 'sdk', 'package', '패키지'],
    'API': ['api', 'service', '서비스', 'endpoint', 'rest', 'graphql'],
    'STARTER_KIT': ['starter', 'template', 'boilerplate', '스타터', '템플릿', '시작', '시작하기'],
  };
  
  const resourceTypeKeywords = typeKeywords[resource.type] || [];
  resourceTypeKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      score += 15;
    }
  });

  // 6. 카테고리 매칭 (의미 기반)
  const categoryKeywords: Record<string, string[]> = {
    'AI_ML': ['ai', 'ml', 'machine learning', '딥러닝', 'deep learning', 'neural', 'neural network', '인공지능', '머신러닝'],
    'WEB': ['web', 'website', '웹', '웹사이트', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드'],
    'DATA': ['data', 'database', '데이터', '데이터베이스', 'db', 'sql', 'nosql', 'vector', 'embedding'],
    'DEVOPS': ['devops', 'deploy', '배포', 'docker', 'kubernetes', 'ci/cd', 'infrastructure', '인프라'],
    'TOOLING': ['tool', '도구', 'utility', '유틸리티', 'automation', '자동화', 'testing', '테스트'],
    'MCP': ['mcp', 'model context protocol', 'server', '서버', 'provider', '프로바이더'],
  };

  const resourceCategory = getResourceCategory(resource.type);
  const categoryKeywordsList = categoryKeywords[resourceCategory] || [];
  categoryKeywordsList.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      score += 15;
    }
  });

  // 7. 동의어 및 관련어 매칭
  const synonyms: Record<string, string[]> = {
    '이미지': ['image', 'picture', 'photo', 'vision', 'visual'],
    '분석': ['analysis', 'analyze', 'analyzing', 'parse', 'parsing'],
    '봇': ['bot', 'agent', 'assistant', 'chatbot', '챗봇'],
    '만들기': ['create', 'build', 'make', 'develop', 'development', '구축', '개발'],
    '라이브러리': ['library', 'lib', 'package', 'module', '패키지', '모듈'],
    '웹사이트': ['website', 'web', 'site', 'webpage', '웹', '사이트'],
    '개선': ['improve', 'enhance', 'optimize', 'optimization', '최적화'],
    '챗봇': ['chatbot', 'chat', 'bot', 'assistant', '봇', '챗'],
  };

  Object.entries(synonyms).forEach(([key, values]) => {
    if (lowerQuery.includes(key)) {
      values.forEach(synonym => {
        if (titleLower.includes(synonym) || descLower.includes(synonym)) {
          score += 15;
        }
        resource.tags.forEach(tag => {
          if (tag.toLowerCase().includes(synonym)) {
            score += 10;
          }
        });
      });
    }
  });

  return score;
}

/**
 * 리소스 타입에서 카테고리 추출
 */
function getResourceCategory(type: string): string {
  const typeToCategory: Record<string, string> = {
    'VSCODE_EXT': 'TOOLING',
    'CLI_EXTENSION': 'TOOLING',
    'AGENT_SKILL': 'AI_ML',
    'LIBRARY': 'TOOLING',
    'API': 'WEB',
    'STARTER_KIT': 'WEB',
  };
  return typeToCategory[type] || 'TOOLING';
}

/**
 * 자연어 쿼리로 리소스를 검색하고 관련도 순으로 정렬
 */
export function searchResourcesByRelevance(resources: Resource[], query: string): Resource[] {
  if (!query || query.trim().length === 0) {
    return resources;
  }

  const queryLower = query.toLowerCase().trim();
  
  // 각 리소스에 대해 관련도 점수 계산
  const resourcesWithScores = resources.map(resource => ({
    resource,
    score: calculateRelevanceScore(resource, queryLower),
  }));

  // 점수 순으로 정렬 (높은 점수 우선)
  resourcesWithScores.sort((a, b) => b.score - a.score);

  // 점수가 0보다 큰 리소스만 반환 (관련 없는 리소스 제외)
  return resourcesWithScores
    .filter(item => item.score > 0)
    .map(item => item.resource);
}

