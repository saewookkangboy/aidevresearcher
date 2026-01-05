/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { LinkHealthStatus } from '../../utils/types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

interface LinkHealthIndicatorProps {
  status: LinkHealthStatus;
}

export function LinkHealthIndicator({ status }: LinkHealthIndicatorProps) {
  // Frontend에서는 checking 상태를 표시하지 않고 최종 결과만 표시
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">링크 상태 (최종 결과)</h4>
        <HelpTooltip
          content="모든 도구의 링크가 정상적으로 작동하는지 확인한 결과입니다. '정상'은 링크가 잘 작동하고, '깨짐'은 링크가 작동하지 않으며, '수정됨'은 자동으로 수정된 링크입니다."
          title="링크 상태 설명"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{status.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">전체</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            {status.active}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">정상</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            {status.broken}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">깨짐</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-700 dark:text-green-500">
            <AlertTriangle className="w-5 h-5" />
            {status.fixed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">수정됨</div>
        </div>
      </div>
    </div>
  );
}

