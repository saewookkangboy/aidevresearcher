import { ResourceType, ResourceCategory } from './types';

// 자연어 의도 파악을 위한 간단한 키워드 매칭
export function inferResourceTypeFromQuery(query: string): ResourceType[] {
  const lowerQuery = query.toLowerCase();
  const types: ResourceType[] = [];

  if (lowerQuery.includes('cli') || lowerQuery.includes('command') || lowerQuery.includes('터미널')) {
    types.push('CLI_EXTENSION');
  }
  if (lowerQuery.includes('skill') || lowerQuery.includes('능력') || lowerQuery.includes('기능')) {
    types.push('AGENT_SKILL');
  }
  if (lowerQuery.includes('library') || lowerQuery.includes('lib') || lowerQuery.includes('라이브러리') || lowerQuery.includes('패키지')) {
    types.push('LIBRARY');
  }
  if (lowerQuery.includes('vscode') || lowerQuery.includes('extension') || lowerQuery.includes('확장')) {
    types.push('VSCODE_EXT');
  }
  if (lowerQuery.includes('api') || lowerQuery.includes('서비스')) {
    types.push('API');
  }
  if (lowerQuery.includes('starter') || lowerQuery.includes('template') || lowerQuery.includes('boilerplate') || lowerQuery.includes('템플릿')) {
    types.push('STARTER_KIT');
  }

  return types.length > 0 ? types : [];
}

// 자연어 검색에서 카테고리 추론
export function inferCategoryFromQuery(query: string): ResourceCategory[] {
  const lowerQuery = query.toLowerCase();
  const categories: ResourceCategory[] = [];

  // Skills 카테고리 키워드
  if (
    lowerQuery.includes('skill') ||
    lowerQuery.includes('skills') ||
    lowerQuery.includes('능력') ||
    lowerQuery.includes('스킬') ||
    lowerQuery.includes('agent skill') ||
    lowerQuery.includes('에이전트 스킬')
  ) {
    categories.push('SKILLS');
  }

  // Tools 카테고리 키워드
  if (
    lowerQuery.includes('tool') ||
    lowerQuery.includes('tools') ||
    lowerQuery.includes('도구') ||
    lowerQuery.includes('라이브러리') ||
    lowerQuery.includes('library') ||
    lowerQuery.includes('lib') ||
    lowerQuery.includes('api') ||
    lowerQuery.includes('starter') ||
    lowerQuery.includes('template') ||
    lowerQuery.includes('프레임워크') ||
    lowerQuery.includes('framework') ||
    lowerQuery.includes('sdk') ||
    lowerQuery.includes('패키지') ||
    lowerQuery.includes('package')
  ) {
    categories.push('TOOLS');
  }

  // Extension 카테고리 키워드
  if (
    lowerQuery.includes('extension') ||
    lowerQuery.includes('extensions') ||
    lowerQuery.includes('확장') ||
    lowerQuery.includes('vscode') ||
    lowerQuery.includes('cli') ||
    lowerQuery.includes('command') ||
    lowerQuery.includes('터미널') ||
    lowerQuery.includes('terminal') ||
    lowerQuery.includes('plugin') ||
    lowerQuery.includes('플러그인') ||
    lowerQuery.includes('copilot') ||
    lowerQuery.includes('cursor')
  ) {
    categories.push('EXTENSION');
  }

  return categories.length > 0 ? categories : [];
}

export function extractKeywords(query: string): string[] {
  const keywords: string[] = [];
  const lowerQuery = query.toLowerCase();

  // 기술 스택 키워드
  const techStack = ['python', 'javascript', 'typescript', 'node', 'react', 'langchain', 'openai', 'gemini', 'claude'];
  techStack.forEach(tech => {
    if (lowerQuery.includes(tech)) {
      keywords.push(tech);
    }
  });

  // 기능 키워드
  const features = ['image', 'vision', 'audio', 'text', 'search', 'web', 'file', 'database'];
  features.forEach(feature => {
    if (lowerQuery.includes(feature)) {
      keywords.push(feature);
    }
  });

  return keywords;
}

