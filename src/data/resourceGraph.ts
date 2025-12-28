export const RESOURCE_GRAPH: Record<string | number, Array<string | number>> = {
  '6': ['tool-1', 'tool-2', 'tool-3'], // dev-agent-kit -> LangGraph, CrewAI, AutoGen
  'tool-1': ['6', 'tool-3'],
  'tool-2': ['6', 'tool-7'],
  'tool-3': ['6', 'tool-1'],
};
