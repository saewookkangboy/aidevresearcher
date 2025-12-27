/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { ResourceType, ResourceCategory } from './types';

// 자연어 의도 파악을 위한 간단한 키워드 매칭
export function inferResourceTypeFromQuery(query: string): ResourceType[] {
  const lowerQuery = query.toLowerCase();
  const types: ResourceType[] = [];

  // VSCODE_EXT: VS Code 확장, 에디터 플러그인 (CLI보다 우선 검사)
  if (
    lowerQuery.includes('vscode') || 
    lowerQuery.includes('visual studio code') ||
    (lowerQuery.includes('extension') && (lowerQuery.includes('editor') || lowerQuery.includes('에디터') || lowerQuery.includes('marketplace'))) ||
    lowerQuery.includes('code editor') ||
    lowerQuery.includes('에디터 확장') ||
    lowerQuery.includes('editor plugin') ||
    lowerQuery.includes('코드 에디터') ||
    lowerQuery.includes('copilot') ||
    lowerQuery.includes('cursor') ||
    (lowerQuery.includes('install') && lowerQuery.includes('marketplace'))
  ) {
    types.push('VSCODE_EXT');
  }
  
  // CLI_EXTENSION: 명령줄 도구, 터미널 확장, MCP 서버 (VS Code가 아닌 경우)
  if (
    (lowerQuery.includes('cli') && !lowerQuery.includes('vscode') && !lowerQuery.includes('visual studio')) || 
    (lowerQuery.includes('command') && !lowerQuery.includes('code editor')) || 
    lowerQuery.includes('터미널') ||
    lowerQuery.includes('gemini cli') ||
    lowerQuery.includes('gemini extension') ||
    lowerQuery.includes('mcp server') ||
    (lowerQuery.includes('mcp') && !lowerQuery.includes('vscode')) ||
    lowerQuery.includes('명령줄') ||
    lowerQuery.includes('cli 도구') ||
    lowerQuery.includes('터미널 도구')
  ) {
    types.push('CLI_EXTENSION');
  }
  
  // AGENT_SKILL: 재사용 가능한 모듈, 작업별 스킬, 사전 정의된 스킬 세트
  if (
    lowerQuery.includes('skill') || 
    lowerQuery.includes('skills') ||
    lowerQuery.includes('skillset') ||
    lowerQuery.includes('skillsets') ||
    lowerQuery.includes('능력') || 
    (lowerQuery.includes('기능') && !lowerQuery.includes('확장 기능')) ||
    lowerQuery.includes('스킬') ||
    lowerQuery.includes('agent skill') ||
    lowerQuery.includes('에이전트 스킬') ||
    (lowerQuery.includes('재사용') && lowerQuery.includes('모듈')) ||
    (lowerQuery.includes('모듈') && (lowerQuery.includes('재사용') || lowerQuery.includes('task-specific'))) ||
    lowerQuery.includes('task-specific') ||
    lowerQuery.includes('pre-built skill') ||
    lowerQuery.includes('predefined skill')
  ) {
    types.push('AGENT_SKILL');
  }
  
  // LIBRARY: 프레임워크, SDK, 라이브러리, 개발 도구
  if (
    lowerQuery.includes('library') || 
    lowerQuery.includes('libraries') ||
    (lowerQuery.includes('lib') && !lowerQuery.includes('cli') && !lowerQuery.includes('extension')) || 
    lowerQuery.includes('라이브러리') || 
    lowerQuery.includes('패키지') ||
    lowerQuery.includes('framework') ||
    lowerQuery.includes('프레임워크') ||
    lowerQuery.includes('sdk') ||
    ((lowerQuery.includes('pip install') || lowerQuery.includes('npm install')) && !lowerQuery.includes('extension')) ||
    lowerQuery.includes('프레임워크로') ||
    (lowerQuery.includes('개발 도구') && !lowerQuery.includes('cli'))
  ) {
    types.push('LIBRARY');
  }
  
  // API: API 서비스, 외부 서비스 연동
  if (
    (lowerQuery.includes('api') && !lowerQuery.includes('library') && !lowerQuery.includes('sdk')) ||
    lowerQuery.includes('서비스') ||
    lowerQuery.includes('api 서비스') ||
    lowerQuery.includes('외부 서비스') ||
    lowerQuery.includes('integration') && lowerQuery.includes('api')
  ) {
    types.push('API');
  }
  
  // STARTER_KIT: 시작 프로젝트, 템플릿, 보일러플레이트
  if (
    lowerQuery.includes('starter') || 
    lowerQuery.includes('starter kit') ||
    lowerQuery.includes('template') || 
    lowerQuery.includes('boilerplate') || 
    lowerQuery.includes('템플릿') ||
    lowerQuery.includes('시작 프로젝트') ||
    lowerQuery.includes('보일러플레이트') ||
    lowerQuery.includes('git clone') ||
    lowerQuery.includes('예제 프로젝트') ||
    lowerQuery.includes('샘플 프로젝트')
  ) {
    types.push('STARTER_KIT');
  }

  return types.length > 0 ? types : [];
}

// 자연어 검색에서 카테고리 추론
export function inferCategoryFromQuery(query: string): ResourceCategory[] {
  const lowerQuery = query.toLowerCase();
  const categories: ResourceCategory[] = [];

  // Skills 카테고리 키워드: 재사용 가능한 모듈, 작업별 스킬, 에이전트 능력 향상
  if (
    lowerQuery.includes('skill') ||
    lowerQuery.includes('skills') ||
    lowerQuery.includes('skillset') ||
    lowerQuery.includes('skillsets') ||
    lowerQuery.includes('능력') ||
    lowerQuery.includes('스킬') ||
    lowerQuery.includes('agent skill') ||
    lowerQuery.includes('에이전트 스킬') ||
    lowerQuery.includes('재사용 가능') ||
    lowerQuery.includes('재사용 모듈') ||
    lowerQuery.includes('작업별 스킬') ||
    lowerQuery.includes('task-specific') ||
    lowerQuery.includes('pre-built') ||
    lowerQuery.includes('predefined') ||
    lowerQuery.includes('모듈로') ||
    (lowerQuery.includes('enhance') && lowerQuery.includes('capability')) ||
    (lowerQuery.includes('능력 향상') || lowerQuery.includes('기능 향상'))
  ) {
    categories.push('SKILLS');
  }

  // Tools 카테고리 키워드: 프레임워크, SDK, 라이브러리, API, 시작 프로젝트
  if (
    lowerQuery.includes('tool') ||
    lowerQuery.includes('tools') ||
    lowerQuery.includes('도구') ||
    lowerQuery.includes('라이브러리') ||
    lowerQuery.includes('library') ||
    lowerQuery.includes('libraries') ||
    lowerQuery.includes('lib') ||
    (lowerQuery.includes('api') && !lowerQuery.includes('extension')) ||
    lowerQuery.includes('starter') ||
    lowerQuery.includes('starter kit') ||
    lowerQuery.includes('template') ||
    lowerQuery.includes('템플릿') ||
    lowerQuery.includes('프레임워크') ||
    lowerQuery.includes('framework') ||
    lowerQuery.includes('frameworks') ||
    lowerQuery.includes('sdk') ||
    lowerQuery.includes('패키지') ||
    lowerQuery.includes('package') ||
    lowerQuery.includes('개발 도구') ||
    lowerQuery.includes('프레임워크로') ||
    lowerQuery.includes('보일러플레이트') ||
    lowerQuery.includes('boilerplate') ||
    (lowerQuery.includes('pip install') || lowerQuery.includes('npm install')) && !lowerQuery.includes('extension') ||
    lowerQuery.includes('시작 프로젝트') ||
    lowerQuery.includes('예제 프로젝트')
  ) {
    categories.push('TOOLS');
  }

  // Extension 카테고리 키워드: CLI 확장, VS Code 확장, 명령줄 도구, 에디터 플러그인
  if (
    lowerQuery.includes('extension') ||
    lowerQuery.includes('extensions') ||
    lowerQuery.includes('확장') ||
    lowerQuery.includes('vscode') ||
    lowerQuery.includes('visual studio code') ||
    lowerQuery.includes('cli') ||
    lowerQuery.includes('command') ||
    lowerQuery.includes('command line') ||
    lowerQuery.includes('터미널') ||
    lowerQuery.includes('terminal') ||
    lowerQuery.includes('plugin') ||
    lowerQuery.includes('플러그인') ||
    lowerQuery.includes('copilot') ||
    lowerQuery.includes('cursor') ||
    lowerQuery.includes('gemini cli') ||
    lowerQuery.includes('gemini extension') ||
    lowerQuery.includes('mcp server') ||
    lowerQuery.includes('mcp') ||
    lowerQuery.includes('명령줄') ||
    lowerQuery.includes('cli 도구') ||
    lowerQuery.includes('터미널 도구') ||
    lowerQuery.includes('에디터') ||
    lowerQuery.includes('code editor') ||
    lowerQuery.includes('editor plugin') ||
    lowerQuery.includes('코드 완성') ||
    lowerQuery.includes('code completion') ||
    lowerQuery.includes('pair programming') ||
    lowerQuery.includes('페어 프로그래밍') ||
    (lowerQuery.includes('install') && (lowerQuery.includes('marketplace') || lowerQuery.includes('gemini extensions'))) ||
    lowerQuery.includes('autopilot')
  ) {
    categories.push('EXTENSION');
  }

  return categories.length > 0 ? categories : [];
}

export function extractKeywords(query: string): string[] {
  const keywords: string[] = [];
  const lowerQuery = query.toLowerCase();

  // 기술 스택 키워드
  const techStack = [
    'python', 'javascript', 'typescript', 'node', 'react', 'vue', 'svelte',
    'langchain', 'openai', 'gemini', 'claude', 'mcp',
    'anthropic', 'vercel', 'microsoft', 'google'
  ];
  techStack.forEach(tech => {
    if (lowerQuery.includes(tech)) {
      keywords.push(tech);
    }
  });

  // 기능 키워드
  const features = [
    'image', 'vision', 'audio', 'text', 'search', 'web', 'file', 'database',
    'agent', 'llm', 'ai', 'nlp', 'rag', 'vector', 'embedding',
    'testing', 'automation', 'scraping', 'crawling', 'monitoring',
    'docker', 'kubernetes', 'cloud', 'aws', 'gcp', 'deployment'
  ];
  features.forEach(feature => {
    if (lowerQuery.includes(feature)) {
      keywords.push(feature);
    }
  });

  // Skills 관련 키워드
  if (lowerQuery.includes('skill') || lowerQuery.includes('스킬') || lowerQuery.includes('능력')) {
    keywords.push('skill');
  }

  // Tools 관련 키워드
  if (lowerQuery.includes('library') || lowerQuery.includes('framework') || lowerQuery.includes('sdk')) {
    keywords.push('library');
  }
  if (lowerQuery.includes('api') && !lowerQuery.includes('extension')) {
    keywords.push('api');
  }
  if (lowerQuery.includes('starter') || lowerQuery.includes('template') || lowerQuery.includes('boilerplate')) {
    keywords.push('starter');
  }

  // Extension 관련 키워드
  if (lowerQuery.includes('cli') || lowerQuery.includes('command') || lowerQuery.includes('터미널')) {
    keywords.push('cli');
  }
  if (lowerQuery.includes('vscode') || lowerQuery.includes('editor') || lowerQuery.includes('에디터')) {
    keywords.push('editor');
  }

  return keywords;
}

