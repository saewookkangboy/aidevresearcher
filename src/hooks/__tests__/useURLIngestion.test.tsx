import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useURLIngestion } from '../useURLIngestion';
import { ResourceProvider } from '../../contexts/ResourceContext';
import { IngestionSimulator } from '../../services/simulation/ingestionSimulator';
import { LinkHealthService } from '../../services/api/linkHealthService';

// Mock dependencies
vi.mock('../../services/simulation/ingestionSimulator');
vi.mock('../../services/api/linkHealthService');
vi.mock('../../utils/safety', () => ({
  detectDangerousCommand: vi.fn(() => ({ risky: false, reasons: [] })),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ResourceProvider>{children}</ResourceProvider>
);

describe('useURLIngestion', () => {
  let mockIngestURL: any;
  let mockCheckLink: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockIngestURL = vi.fn();
    mockCheckLink = vi.fn();
    
    (IngestionSimulator as any).mockImplementation(() => ({
      ingestURL: mockIngestURL,
    }));
    
    (LinkHealthService as any).mockImplementation(() => ({
      checkLink: mockCheckLink,
      autoFixBrokenLink: vi.fn(),
    }));
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useURLIngestion(), { wrapper });

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

    const { result } = renderHook(() => useURLIngestion(), { wrapper });

    const resource = await result.current.ingest('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(resource).toBeDefined();
    expect(resource?.title).toBe('Test Resource');
    expect(mockIngestURL).toHaveBeenCalledWith('https://example.com');
    expect(mockCheckLink).toHaveBeenCalledWith('https://example.com');
  });

  it('should handle ingestion errors', async () => {
    mockIngestURL.mockRejectedValue(new Error('Ingestion failed'));

    const { result } = renderHook(() => useURLIngestion(), { wrapper });

    const resource = await result.current.ingest('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
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

    const { result } = renderHook(() => useURLIngestion(), { wrapper });

    const resource = await result.current.ingest('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
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

    const { result } = renderHook(() => useURLIngestion(), { wrapper });

    const ingestPromise = result.current.ingest('https://example.com');

    await waitFor(() => {
      expect(result.current.validating).toBe(true);
    });

    await ingestPromise;

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });
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

    const mockAutoFix = vi.fn().mockResolvedValue(fixedResource);
    (LinkHealthService as any).mockImplementation(() => ({
      checkLink: mockCheckLink,
      autoFixBrokenLink: mockAutoFix,
    }));

    const { result } = renderHook(() => useURLIngestion(), { wrapper });

    const resource = await result.current.ingest('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAutoFix).toHaveBeenCalled();
  });
});

