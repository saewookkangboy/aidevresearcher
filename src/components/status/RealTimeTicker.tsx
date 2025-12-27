import { ReactNode } from 'react';
import { AutoResearchStatus } from '../../utils/types';
import { Twitter, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface RealTimeTickerProps {
  status: AutoResearchStatus;
}

const platformIcons: Record<string, ReactNode> = {
  X: <Twitter className="w-4 h-4" />,
  THREADS: <Loader2 className="w-4 h-4 animate-spin" />,
  REDDIT: <Loader2 className="w-4 h-4 animate-spin" />,
};

export function RealTimeTicker({ status }: RealTimeTickerProps) {
  if (!status.isActive) {
    return (
      <div className="text-sm text-gray-500">
        Auto-Research가 비활성화되어 있습니다.
      </div>
    );
  }

  const platformLabel = status.platform === 'X' ? 'X (Twitter)' : status.platform || '';

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-2 text-primary-600">
        {status.platform && platformIcons[status.platform]}
        <span className="font-medium">
          {status.platform && `Scanning ${platformLabel} for ${status.currentQuery || 'trends'}...`}
        </span>
      </div>
      {status.lastScanTime && (
        <span className="text-gray-500">
          ({formatDate(status.lastScanTime)})
        </span>
      )}
      {status.itemsFound > 0 && (
        <span className="text-green-600 font-medium">
          {status.itemsFound}개 발견
        </span>
      )}
    </div>
  );
}
