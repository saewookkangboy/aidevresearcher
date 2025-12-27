import { AgentRole, ResourceType } from './types';

export interface RolePreference {
  preferredPlatforms: string[];
  preferredTypes: ResourceType[];
  preferredTags: string[];
  keywords: string[];
}

type ConcreteRole = Exclude<AgentRole, null>;

export const ROLE_PREFERENCES: Record<ConcreteRole, RolePreference> = {
  frontend: {
    preferredPlatforms: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js'],
    preferredTypes: ['LIBRARY', 'VSCODE_EXT', 'STARTER_KIT', 'CLI_EXTENSION'],
    preferredTags: ['react', 'vue', 'angular', 'frontend', 'ui', 'component', 'css', 'tailwind'],
    keywords: ['frontend', 'ui', 'component', 'react', 'vue', 'angular', 'css', 'design'],
  },
  backend: {
    preferredPlatforms: ['Python', 'Node.js', 'Java', 'Go', 'Rust'],
    preferredTypes: ['LIBRARY', 'API', 'CLI_EXTENSION', 'STARTER_KIT'],
    preferredTags: ['backend', 'api', 'server', 'database', 'python', 'node', 'express'],
    keywords: ['backend', 'api', 'server', 'database', 'rest', 'graphql'],
  },
  pm: {
    preferredPlatforms: ['General'],
    preferredTypes: ['STARTER_KIT', 'CLI_EXTENSION', 'API'],
    preferredTags: ['project-management', 'planning', 'documentation', 'spec', 'workflow'],
    keywords: ['project', 'management', 'planning', 'spec', 'documentation', 'workflow'],
  },
  fullstack: {
    preferredPlatforms: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python'],
    preferredTypes: ['LIBRARY', 'STARTER_KIT', 'CLI_EXTENSION', 'API'],
    preferredTags: ['fullstack', 'react', 'node', 'typescript', 'api'],
    keywords: ['fullstack', 'full-stack', 'mern', 'mean', 'react', 'node'],
  },
  devops: {
    preferredPlatforms: ['General'],
    preferredTypes: ['CLI_EXTENSION', 'API', 'STARTER_KIT'],
    preferredTags: ['devops', 'ci-cd', 'docker', 'kubernetes', 'deployment'],
    keywords: ['devops', 'ci-cd', 'docker', 'kubernetes', 'deployment', 'infrastructure'],
  },
  designer: {
    preferredPlatforms: ['React', 'Vue', 'TypeScript', 'JavaScript'],
    preferredTypes: ['LIBRARY', 'VSCODE_EXT', 'STARTER_KIT'],
    preferredTags: ['design', 'ui', 'ux', 'figma', 'component', 'css'],
    keywords: ['design', 'ui', 'ux', 'figma', 'component', 'css', 'styling'],
  },
};

export const ROLE_LABELS: Record<ConcreteRole, string> = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  pm: 'Product Manager',
  fullstack: 'Full Stack Developer',
  devops: 'DevOps Engineer',
  designer: 'UI/UX Designer',
};

export const ROLE_ICONS: Record<ConcreteRole, string> = {
  frontend: '🎨',
  backend: '⚙️',
  pm: '📋',
  fullstack: '🚀',
  devops: '🔧',
  designer: '✨',
};
