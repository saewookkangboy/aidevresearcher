/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export interface VulnerabilityEntry {
  id: string;
  match: string; // lowercase substring to match against title/tags
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export const VULNERABILITY_DB: VulnerabilityEntry[] = [
  {
    id: 'CVE-MOCK-001',
    match: 'dev-agent-kit',
    severity: 'medium',
    description: 'dev-agent-kit v0.x SEO 서브커맨드에서 입력 검증 부족 (모의 데이터). 최신 버전 적용 권장.',
  },
  {
    id: 'CVE-MOCK-002',
    match: 'autogen',
    severity: 'high',
    description: 'Auto agent 실행 시 임의 코드 삽입 가능성 (모의 데이터). 격리된 가상환경 사용 권장.',
  },
  {
    id: 'CVE-MOCK-003',
    match: 'shell',
    severity: 'medium',
    description: '쉘 파이프라인을 포함한 설치 명령은 검증 후 실행 필요.',
  },
];
