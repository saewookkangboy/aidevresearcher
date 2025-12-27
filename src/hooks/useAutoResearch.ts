/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useResources } from '../contexts/ResourceContext';

export function useAutoResearch() {
  const { autoResearchStatus, startAutoResearch, stopAutoResearch } = useResources();

  return {
    status: autoResearchStatus,
    start: startAutoResearch,
    stop: stopAutoResearch,
  };
}

