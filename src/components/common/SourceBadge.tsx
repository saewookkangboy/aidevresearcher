import React from 'react';
import { SourceType } from '../../utils/types';
import { SOURCE_TYPE_LABELS } from '../../utils/constants';
import { Twitter, Github, Link as LinkIcon, User } from 'lucide-react';

interface SourceBadgeProps {
  sourceType: SourceType;
  className?: string;
}

const sourceIcons: Record<SourceType, React.ReactNode> = {
  GITHUB: <Github className="w-3 h-3" />,
  SOCIAL_X: <Twitter className="w-3 h-3" />,
  SOCIAL_THREADS: <LinkIcon className="w-3 h-3" />,
  OFFICIAL: <LinkIcon className="w-3 h-3" />,
  API: <LinkIcon className="w-3 h-3" />,
  USER: <User className="w-3 h-3" />,
};

const sourceColors: Record<SourceType, string> = {
  GITHUB: 'bg-gray-100 text-gray-800',
  SOCIAL_X: 'bg-blue-100 text-blue-800',
  SOCIAL_THREADS: 'bg-black text-white',
  OFFICIAL: 'bg-green-100 text-green-800',
  API: 'bg-purple-100 text-purple-800',
  USER: 'bg-indigo-100 text-indigo-800',
};

export function SourceBadge({ sourceType, className = '' }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sourceColors[sourceType]} ${className}`}
    >
      {sourceIcons[sourceType]}
      {SOURCE_TYPE_LABELS[sourceType]}
    </span>
  );
}

