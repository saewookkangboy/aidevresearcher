/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect, useState } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useResources } from '../../contexts/ResourceContext';
import { ResourceCard } from '../resource/ResourceCard';
import { ROLE_LABELS, ROLE_ICONS } from '../../contexts/RoleContext';
import { Sparkles } from 'lucide-react';

export function RoleRecommendations() {
  const { currentRole, getRecommendations } = useRole();
  const { resources } = useResources();
  const [recommendations, setRecommendations] = useState(
    getRecommendations(resources)
  );

  useEffect(() => {
    if (currentRole) {
      const recs = getRecommendations(resources);
      setRecommendations(recs.slice(0, 6)); // 상위 6개만 표시
    } else {
      setRecommendations([]);
    }
  }, [currentRole, resources, getRecommendations]);

  if (!currentRole || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {ROLE_ICONS[currentRole]} {ROLE_LABELS[currentRole]} 추천 리소스
        </h2>
        <span className="text-sm text-gray-500">
          ({recommendations.length}개)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.resource.id} className="relative">
            <ResourceCard resource={rec.resource} />
            <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {rec.score}점
            </div>
            <div className="mt-2 text-xs text-gray-500 px-1">
              💡 {rec.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
