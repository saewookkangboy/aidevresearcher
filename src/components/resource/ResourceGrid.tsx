import { Resource } from '../../utils/types';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from '../common/EmptyState';

interface ResourceGridProps {
  resources: Resource[];
  onViewDetails?: (resource: Resource) => void;
  onClearSearch?: () => void;
}

export function ResourceGrid({ resources, onViewDetails, onClearSearch }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="리소스를 찾을 수 없습니다"
        description="검색어를 변경하거나 필터를 조정해보세요. 다른 키워드로 검색하면 원하는 리소스를 찾을 수 있습니다."
        action={onClearSearch ? {
          label: '필터 초기화',
          onClick: onClearSearch,
        } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
