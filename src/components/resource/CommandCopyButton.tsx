/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CommandCopyButtonProps {
  command: string;
  className?: string;
}

export function CommandCopyButton({ command, className = '' }: CommandCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
      title="명령어 복사"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">복사됨!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{command}</span>
        </>
      )}
    </button>
  );
}
