import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useURLIngestion } from '../useURLIngestion';
import { detectDangerousCommand } from '../../utils/safety';
// Mock dependencies with constructor-friendly fakes
let mockIngestURL: any;
let mockCheckLink: any;
let mockAutoFix: any;
const mockAddResource = vi.fn();
const mockUpdateResource = vi.fn();
const mockAddActivity = vi.fn();

vi.mock('../../services/simulation/ingestionSimulator', () => ({
  IngestionSimulator: vi.fn().mockImplementation(function () {
    return {
      ingestURL: (...args: any[]) => mockIngestURL(...args),
    };
  }),
}));

vi.mock('../../services/api/linkHealthService', () => ({
  LinkHealthService: vi.fn().mockImplementation(function () {
    return {
      checkLink: (...args: any[]) => mockCheckLink(...args),
      autoFixBrokenLink: (...args: any[]) => mockAutoFix(...args),
    };
  }),
}));

vi.mock('../../utils/safety', () => ({
  detectDangerousCommand: vi.fn(() => ({ risky: false, reasons: [] })),
}));

vi.mock('../../contexts/ResourceContext', () => ({
  useResources: () => ({
    addResource: mockAddResource,
    updateResource: mockUpdateResource,
    addActivity: mockAddActivity,
  }),
}));

describe('useURLIngestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIngestURL = vi.fn();
    mockCheckLink = vi.fn();
    mockAutoFix = vi.fn();
    mockAddResource.mockReset();
    mockUpdateResource.mockReset();
    mockAddActivity.mockReset();
    vi.mocked(detectDangerousCommand).mockReturnValue({ risky: false, reasons: [] });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useURLIngestion());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.validating).toBe(false);
  });

  it('should successfully ingest a valid URL', async () => {
    const mockResource = {
      id: 'test-1',
      title: 'Test Resource',
      type: 'LIBRARY' as const,
      description: 'Test description',
      platforms: ['Node.js'],
      tags: ['test'],
      command: 'npm install test',
      url: 'https://example.com',
      stars: 100,
      isVerified: true,
      source: 'GitHub',
      sourceType: 'GITHUB' as const,
      linkStatus: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockIngestURL.mockResolvedValue(mockResource);
    mockCheckLink.mockResolvedValue('active');

    const { result } = renderHook(() => useURLIngestion());

    let resource: any;
    await act(async () => {
      resource = await result.current.ingest('https://example.com');
    });

    expect(resource).toBeDefined();
    expect(resource?.title).toBe('Test Resource');
    expect(mockIngestURL).toHaveBeenCalledWith('https://example.com');
    expect(mockCheckLink).toHaveBeenCalledWith('https://example.com');
  });

  it('should handle ingestion errors', async () => {
    mockIngestURL.mockRejectedValue(new Error('Ingestion failed'));

    const { result } = renderHook(() => useURLIngestion());

    let resource: any;
    await act(async () => {
      resource = await result.current.ingest('https://example.com');
    });

    expect(resource).toBeNull();
    expect(result.current.error).toBe('Ingestion failed');
  });

  it('should reject dangerous commands', async () => {
    const { detectDangerousCommand } = await import('../../utils/safety');
    vi.mocked(detectDangerousCommand).mockReturnValue({
      risky: true,
      reasons: ['rm -rf', 'dangerous command'],
    });

    const mockResource = {
      id: 'test-1',
      title: 'Test',
      type: 'LIBRARY' as const,
      command: 'rm -rf /',
      url: 'https://example.com',
      platforms: [],
      tags: [],
      isVerified: false,
      source: 'User',
      sourceType: 'USER' as const,
      linkStatus: 'checking' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockIngestURL.mockResolvedValue(mockResource);

    const { result } = renderHook(() => useURLIngestion());

    let resource: any;
    await act(async () => {
      resource = await result.current.ingest('https://example.com');
    });

    expect(resource).toBeNull();
    expect(result.current.error).toContain('위험 명령어가 포함되어');
  });

  it('should set validating state during link check', async () => {
    const mockResource = {
      id: 'test-1',
      title: 'Test',
      type: 'LIBRARY' as const,
      url: 'https://example.com',
      platforms: [],
      tags: [],
      isVerified: false,
      source: 'User',
      sourceType: 'USER' as const,
      linkStatus: 'checking' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockIngestURL.mockResolvedValue(mockResource);
    mockCheckLink.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('active'), 100)));

    const { result } = renderHook(() => useURLIngestion());

    await act(async () => {
      await result.current.ingest('https://example.com');
    });

    expect(result.current.validating).toBe(false);
  });

  it('should handle broken links and attempt auto-fix', async () => {
    const mockResource = {
      id: 'test-1',
      title: 'Test',
      type: 'LIBRARY' as const,
      url: 'https://example.com',
      platforms: [],
      tags: [],
      isVerified: false,
      source: 'User',
      sourceType: 'USER' as const,
      linkStatus: 'checking' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fixedResource = {
      ...mockResource,
      url: 'https://example.com/fixed',
      linkStatus: 'fixed' as const,
      lastCheckedAt: new Date().toISOString(),
    };

    mockIngestURL.mockResolvedValue(mockResource);
    mockCheckLink.mockResolvedValue('broken');

    mockAutoFix.mockResolvedValue(fixedResource);

    const { result } = renderHook(() => useURLIngestion());

    await act(async () => {
      await result.current.ingest('https://example.com');
    });

    expect(result.current.error).toBeNull();
  });
});
