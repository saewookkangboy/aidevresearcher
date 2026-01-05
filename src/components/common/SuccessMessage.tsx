/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  const { t } = useLanguage();
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={t('success.dismiss')}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
