/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../utils/translations';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'vibe_coding_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // 브라우저 언어 감지 또는 저장된 언어 불러오기
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && (saved === 'ko' || saved === 'en')) {
      return saved;
    }
    // 브라우저 언어 감지
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) {
      return 'ko';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langTranslations = translations[language] as Record<string, string>;
    const enTranslations = translations['en'] as Record<string, string>;
    const translation = langTranslations?.[key] || enTranslations?.[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
        translation
      );
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

