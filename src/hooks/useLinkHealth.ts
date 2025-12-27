import { useResources } from '../contexts/ResourceContext';

export function useLinkHealth() {
  const { linkHealthStatus, checkAllLinks, checkLinkHealth } = useResources();

  return {
    healthStatus: linkHealthStatus,
    checkAll: checkAllLinks,
    checkOne: checkLinkHealth,
  };
}

