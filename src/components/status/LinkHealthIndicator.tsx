/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { LinkHealthStatus } from '../../utils/types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';
import { useLanguage } from '../../contexts/LanguageContext';

interface LinkHealthIndicatorProps {
  status: LinkHealthStatus;
}

export function LinkHealthIndicator({ status }: LinkHealthIndicatorProps) {
  const { t } = useLanguage();
  // Frontend에서는 checking 상태를 표시하지 않고 최종 결과만 표시
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('linkHealth.title')}</h4>
        <HelpTooltip
          content={t('linkHealth.help')}
          title={t('linkHealth.title')}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{status.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('linkHealth.total')}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            {status.active}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('linkHealth.active')}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            {status.broken}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('linkHealth.broken')}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-700 dark:text-green-500">
            <AlertTriangle className="w-5 h-5" />
            {status.fixed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('linkHealth.fixed')}</div>
        </div>
      </div>
    </div>
  );
}

