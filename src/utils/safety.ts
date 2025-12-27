import { Resource } from './types';
import { VULNERABILITY_DB } from '../data/vulnerabilities';

interface RiskResult {
  risky: boolean;
  reasons: string[];
}

const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+-rf\s+\/?/i, reason: 'rm -rf 실행 위험' },
  { pattern: /sudo\s+/i, reason: 'sudo 권한 요구' },
  { pattern: /mkfs|fdisk|diskutil\s+eraseDisk/i, reason: '디스크 포맷/파티션 위험' },
  { pattern: /dd\s+if=|dd\s+of=/i, reason: 'dd 명령 데이터 파괴 위험' },
  { pattern: /(curl|wget).+\|\s*(sh|bash)/i, reason: '원격 스크립트 파이프 실행' },
  { pattern: /chmod\s+777/i, reason: '퍼미션 과다 부여' },
  { pattern: /shutdown|reboot/i, reason: '시스템 종료/재부팅 위험' },
];

export function detectDangerousCommand(command: string): RiskResult {
  if (!command) return { risky: false, reasons: [] };

  const reasons = DANGEROUS_PATTERNS
    .filter(({ pattern }) => pattern.test(command))
    .map(({ reason }) => reason);

  return { risky: reasons.length > 0, reasons };
}

export interface VulnerabilityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export function getVulnerabilityFindings(resource: Resource): VulnerabilityFinding[] {
  const findings: VulnerabilityFinding[] = [];
  const lowerTitle = resource.title.toLowerCase();
  const lowerTags = resource.tags.map((t) => t.toLowerCase());

  VULNERABILITY_DB.forEach((entry) => {
    const matchesTitle = lowerTitle.includes(entry.match);
    const matchesTag = lowerTags.some((tag) => tag.includes(entry.match));
    if (matchesTitle || matchesTag) {
      findings.push({
        id: entry.id,
        severity: entry.severity,
        summary: entry.description,
      });
    }
  });

  return findings;
}
