/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useResources } from '../contexts/ResourceContext';

export function useLinkHealth() {
  const { linkHealthStatus, checkAllLinks, checkLinkHealth } = useResources();

  return {
    healthStatus: linkHealthStatus,
    checkAll: checkAllLinks,
    checkOne: checkLinkHealth,
  };
}

