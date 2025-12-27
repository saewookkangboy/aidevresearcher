import { ResourceType, ResourceCategory } from './types';

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  CLI_EXTENSION: 'CLI Extension',
  AGENT_SKILL: 'Agent Skill',
  LIBRARY: 'Library',
  VSCODE_EXT: 'VS Code Extension',
  API: 'API',
  STARTER_KIT: 'Starter Kit',
};

// ResourceType을 카테고리로 매핑
export const RESOURCE_TYPE_TO_CATEGORY: Record<ResourceType, ResourceCategory> = {
  AGENT_SKILL: 'SKILLS',
  LIBRARY: 'TOOLS',
  API: 'TOOLS',
  STARTER_KIT: 'TOOLS',
  CLI_EXTENSION: 'EXTENSION',
  VSCODE_EXT: 'EXTENSION',
};

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  SKILLS: 'Skills',
  TOOLS: 'Tools',
  EXTENSION: 'Extension',
};

export const CATEGORY_ICONS: Record<ResourceCategory, string> = {
  SKILLS: '🎯',
  TOOLS: '🛠️',
  EXTENSION: '🔌',
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  GITHUB: 'GitHub',
  OFFICIAL: 'Official',
  SOCIAL_X: 'X (Twitter)',
  SOCIAL_THREADS: 'Threads',
  API: 'API',
  USER: 'User Submitted',
};

export const LINK_STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-300',
  checking: 'bg-blue-500 animate-pulse',
  active: 'bg-green-500',
  broken: 'bg-red-500',
  fixed: 'bg-green-500',
};

export const AUTO_RESEARCH_INTERVAL = 5 * 60 * 1000; // 5분
export const LINK_HEALTH_CHECK_DELAY = 1000; // 1초
export const LINK_HEALTH_CHECK_INTERVAL = 60 * 60 * 1000; // 1시간

export const STORAGE_KEY = 'vibe_coding_resources';

