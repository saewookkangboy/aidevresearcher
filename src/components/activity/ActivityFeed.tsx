import { Clock3, RefreshCw, Trash2 } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';

export function ActivityFeed() {
  const { activityLog, clearActivity, refreshResources } = useResources();

  const sorted = [...activityLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sorted.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">활동 로그</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => refreshResources()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={clearActivity}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-4 h-4" />
            비우기
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto text-sm">
        {sorted.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700"
          >
            <span className="text-xs font-semibold uppercase text-primary-600">
              {event.type}
            </span>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-200">{event.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
