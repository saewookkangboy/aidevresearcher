/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect, useState } from 'react';
import { LinkHealthStatus } from '../../utils/types';
import { Activity, RefreshCcw } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';
import { useLanguage } from '../../contexts/LanguageContext';

interface LiveOpsBarProps {
  status: LinkHealthStatus;
  onCheckAll: () => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
}

export function LiveOpsBar({ status, onCheckAll, onRefresh }: LiveOpsBarProps) {
  const { t } = useLanguage();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      onCheckAll();
    }, 90_000);
    return () => clearInterval(timer);
  }, [autoRefresh, onCheckAll]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-sm">
      <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
        <Activity className="w-4 h-4 text-primary-600" />
        {t('liveOps.realtime')}
        <HelpTooltip
          content={t('liveOps.help')}
          title={t('liveOps.title')}
        />
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>{t('liveOps.total')} {status.total}</span>
        <span className="text-green-600">{t('linkHealth.active')} {status.active}</span>
        <span className="text-red-600">{t('linkHealth.broken')} {status.broken}</span>
        <span className="text-amber-600">{t('linkHealth.fixed')} {status.fixed}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onCheckAll}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCcw className="w-4 h-4" />
          {t('liveOps.checkAll')}
        </button>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {t('liveOps.refresh')}
        </button>
        <label className="flex items-center gap-1 cursor-pointer text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          {t('liveOps.autoRefresh')}
        </label>
      </div>
    </div>
  );
}
