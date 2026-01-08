/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { ResourceType, ResourceCategory } from './types';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 다국어 지원 라벨 가져오기 훅
 */
export function useTranslatedLabels() {
  const { t } = useLanguage();

  const getResourceTypeLabel = (type: ResourceType): string => {
    return t(`resourceType.${type}`);
  };

  const getCategoryLabel = (category: ResourceCategory): string => {
    return t(`category.${category}`);
  };

  const getSourceTypeLabel = (sourceType: string): string => {
    return t(`source.${sourceType}`) || sourceType;
  };

  return {
    getResourceTypeLabel,
    getCategoryLabel,
    getSourceTypeLabel,
  };
}

/**
 * 다국어 지원 라벨 가져오기 함수 (훅 없이 사용)
 */
export function getTranslatedLabel(key: string, language: 'ko' | 'en' = 'en'): string {
  const translations: Record<'ko' | 'en', Record<string, string>> = {
    ko: {
      'resourceType.CLI_EXTENSION': 'CLI 확장',
      'resourceType.AGENT_SKILL': '에이전트 스킬',
      'resourceType.LIBRARY': '라이브러리',
      'resourceType.VSCODE_EXT': 'VS Code 확장',
      'resourceType.API': 'API',
      'resourceType.STARTER_KIT': '스타터 키트',
      'category.SKILLS': '스킬',
      'category.TOOLS': '도구',
      'category.EXTENSION': '확장',
      'category.MCP': 'MCP 서버',
      'source.GITHUB': 'GitHub',
      'source.OFFICIAL': '공식',
      'source.SOCIAL_X': 'X (트위터)',
      'source.SOCIAL_THREADS': 'Threads',
      'source.API': 'API',
      'source.USER': '사용자 제출',
    },
    en: {
      'resourceType.CLI_EXTENSION': 'CLI Extension',
      'resourceType.AGENT_SKILL': 'Agent Skill',
      'resourceType.LIBRARY': 'Library',
      'resourceType.VSCODE_EXT': 'VS Code Extension',
      'resourceType.API': 'API',
      'resourceType.STARTER_KIT': 'Starter Kit',
      'category.SKILLS': 'Skills',
      'category.TOOLS': 'Tools',
      'category.EXTENSION': 'Extension',
      'category.MCP': 'MCP Server',
      'source.GITHUB': 'GitHub',
      'source.OFFICIAL': 'Official',
      'source.SOCIAL_X': 'X (Twitter)',
      'source.SOCIAL_THREADS': 'Threads',
      'source.API': 'API',
      'source.USER': 'User Submitted',
    },
  };

  const langTranslations = translations[language];
  if (langTranslations && key in langTranslations) {
    return langTranslations[key];
  }
  return key;
}

