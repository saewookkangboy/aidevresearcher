import { useResources } from '../contexts/ResourceContext';

export function useAutoResearch() {
  const { autoResearchStatus, startAutoResearch, stopAutoResearch } = useResources();

  return {
    status: autoResearchStatus,
    start: startAutoResearch,
    stop: stopAutoResearch,
  };
}

