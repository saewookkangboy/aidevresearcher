/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect } from 'react';
import { ResourceProvider } from './contexts/ResourceContext';
import { RoleProvider } from './contexts/RoleContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppContent } from './components/AppContent';
import { autoOptimizer } from './services/optimization/autoOptimizer';

function App() {
  // 자동 최적화 시스템 시작
  useEffect(() => {
    autoOptimizer.start();

    // 컴포넌트 언마운트 시 정리
    return () => {
      autoOptimizer.stop();
    };
  }, []);

  return (
    <LanguageProvider>
      <ResourceProvider>
        <RoleProvider>
          <AdminProvider>
            <AppContent />
          </AdminProvider>
        </RoleProvider>
      </ResourceProvider>
    </LanguageProvider>
  );
}

export default App;
