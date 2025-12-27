import { useEffect, useState } from 'react';
import { LinkHealthStatus } from '../../utils/types';
import { Activity, RefreshCcw } from 'lucide-react';

interface LiveOpsBarProps {
  status: LinkHealthStatus;
  onCheckAll: () => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
}

export function LiveOpsBar({ status, onCheckAll, onRefresh }: LiveOpsBarProps) {
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
        실시간 상태
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>총 {status.total}</span>
        <span className="text-green-600">정상 {status.active}</span>
        <span className="text-red-600">깨짐 {status.broken}</span>
        <span className="text-amber-600">수정됨 {status.fixed}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onCheckAll}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCcw className="w-4 h-4" />
          링크 재검사
        </button>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          데이터 새로고침
        </button>
        <label className="flex items-center gap-1 cursor-pointer text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          자동 90초 체크
        </label>
      </div>
    </div>
  );
}
