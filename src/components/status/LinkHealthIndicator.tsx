import { LinkHealthStatus } from '../../utils/types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface LinkHealthIndicatorProps {
  status: LinkHealthStatus;
}

export function LinkHealthIndicator({ status }: LinkHealthIndicatorProps) {
  // Frontend에서는 checking 상태를 표시하지 않고 최종 결과만 표시
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">링크 상태 (최종 결과)</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{status.total}</div>
          <div className="text-xs text-gray-500">전체</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
            <CheckCircle className="w-5 h-5" />
            {status.active}
          </div>
          <div className="text-xs text-gray-500">정상</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
            <XCircle className="w-5 h-5" />
            {status.broken}
          </div>
          <div className="text-xs text-gray-500">깨짐</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-700">
            <AlertTriangle className="w-5 h-5" />
            {status.fixed}
          </div>
          <div className="text-xs text-gray-500">수정됨</div>
        </div>
      </div>
    </div>
  );
}

