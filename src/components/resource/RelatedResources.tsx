/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useMemo } from 'react';
import { Resource } from '../../utils/types';
import { ResourceCard } from './ResourceCard';
import { LinkIcon } from 'lucide-react';

interface RelatedResourcesProps {
  resources: Resource[];
}

function similarityScore(a: Resource, b: Resource): number {
  let score = 0;
  const tagOverlap = a.tags.filter((tag) => b.tags.includes(tag)).length;
  score += tagOverlap * 5;
  if (a.type === b.type) score += 5;
  const platformOverlap = a.platforms.filter((p) => b.platforms.includes(p)).length;
  score += platformOverlap * 2;
  return score;
}

export function RelatedResources({ resources }: RelatedResourcesProps) {
  const related = useMemo(() => {
    if (resources.length < 2) return null;
    const anchor = resources[0];
    const scored = resources
      .slice(1)
      .map((r) => ({ resource: r, score: similarityScore(anchor, r) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return { anchor, items: scored };
  }, [resources]);

  if (!related || related.items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          함께 쓰면 좋은 리소스
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        기준 리소스: <span className="font-semibold">{related.anchor.title}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.items.map(({ resource }) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
