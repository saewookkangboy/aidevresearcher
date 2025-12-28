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
  onCopied?: () => void;
}

export function CommandCopyButton({ command, className = '', onCopied }: CommandCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 개발 환경에서만 에러 로그 출력
      if (import.meta.env.DEV) {
        console.error('Failed to copy:', error);
      }
      // 사용자에게 피드백 제공 (선택사항)
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-start gap-2 px-3 py-1.5 rounded-md text-sm font-mono bg-gray-100 hover:bg-gray-200 transition-colors w-full max-w-full overflow-hidden ${className}`}
      title="명령어 복사"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-green-600 break-words">복사됨!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="break-words break-all whitespace-normal overflow-wrap-anywhere">{command}</span>
        </>
      )}
    </button>
  );
}
