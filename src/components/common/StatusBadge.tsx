/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { LinkStatus } from '../../utils/types';
import { LINK_STATUS_COLORS } from '../../utils/constants';

interface StatusBadgeProps {
  status: LinkStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  // Frontend에서는 checking 상태를 표시하지 않고 idle로 표시
  const displayStatus = status === 'checking' ? 'idle' : status;
  
  const statusLabels: Record<Exclude<LinkStatus, 'checking'>, string> = {
    idle: '대기',
    active: '정상',
    broken: '깨짐',
    fixed: '수정됨',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${LINK_STATUS_COLORS[displayStatus]} ${className}`}
    >
      <span className="w-2 h-2 rounded-full mr-1" />
      {statusLabels[displayStatus]}
    </span>
  );
}
