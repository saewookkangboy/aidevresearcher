/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { ResourceProvider } from './contexts/ResourceContext';
import { RoleProvider } from './contexts/RoleContext';
import { AppContent } from './components/AppContent';

function App() {
  return (
    <ResourceProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </ResourceProvider>
  );
}

export default App;
