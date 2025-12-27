import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionSimulator } from '../ingestionSimulator';
import { AIParsingService } from '../../api/aiParsingService';
import { Resource } from '../../../utils/types';

// Mock AIParsingService
vi.mock('../../api/aiParsingService', () => ({
  AIParsingService: vi.fn().mockImplementation(() => ({
    analyzeURL: vi.fn(),
  })),
}));

describe('IngestionSimulator', () => {
  let simulator: IngestionSimulator;
  let mockAIService: any;

  beforeEach(() => {
    mockAIService = {
      analyzeURL: vi.fn(),
    };
    (AIParsingService as any).mockImplementation(() => mockAIService);
    simulator = new IngestionSimulator();
  });

  describe('ingestURL', () => {
    it('should successfully ingest a valid URL', async () => {
      const mockAnalysis = {
        title: 'Test Library',
        type: 'LIBRARY' as const,
        description: 'A test library',
        command: 'npm install test-library',
        stars: 1000,
        isVerified: true,
        source: 'GitHub',
        sourceType: 'GITHUB' as const,
      };

      mockAIService.analyzeURL.mockResolvedValue(mockAnalysis);

      const result = await simulator.ingestURL('https://github.com/test/test-library');

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Library');
      expect(result.type).toBe('LIBRARY');
      expect(result.url).toBe('https://github.com/test/test-library');
      expect(result.platforms).toContain('Node.js');
      expect(result.platforms).toContain('JavaScript');
      expect(result.id).toMatch(/^resource_\d+_[a-z0-9]+$/);
    });

    it('should throw error for invalid URL format', async () => {
      await expect(simulator.ingestURL('invalid-url')).rejects.toThrow('Invalid URL format');
    });

    it('should throw error for URL without http/https', async () => {
      await expect(simulator.ingestURL('ftp://example.com')).rejects.toThrow('Invalid URL format');
    });

    it('should use default values when analysis returns partial data', async () => {
      mockAIService.analyzeURL.mockResolvedValue({
        title: 'Test',
      });

      const result = await simulator.ingestURL('https://example.com');

      expect(result.title).toBe('Test');
      expect(result.type).toBe('LIBRARY');
      expect(result.description).toBe('No description available');
      expect(result.platforms).toEqual(['General']);
    });

    it('should infer Python platform from pip command', async () => {
      mockAIService.analyzeURL.mockResolvedValue({
        title: 'Python Lib',
        command: 'pip install python-lib',
      });

      const result = await simulator.ingestURL('https://pypi.org/project/python-lib');

      expect(result.platforms).toContain('Python');
    });

    it('should infer Rust platform from cargo command', async () => {
      mockAIService.analyzeURL.mockResolvedValue({
        title: 'Rust Crate',
        command: 'cargo add rust-crate',
      });

      const result = await simulator.ingestURL('https://crates.io/crates/rust-crate');

      expect(result.platforms).toContain('Rust');
    });

    it('should infer Go platform from go get command', async () => {
      mockAIService.analyzeURL.mockResolvedValue({
        title: 'Go Package',
        command: 'go get github.com/example/package',
      });

      const result = await simulator.ingestURL('https://github.com/example/package');

      expect(result.platforms).toContain('Go');
    });

    it('should generate tags from title and type', async () => {
      mockAIService.analyzeURL.mockResolvedValue({
        title: 'React Component Library',
        type: 'LIBRARY',
      });

      const result = await simulator.ingestURL('https://example.com');

      expect(result.tags.length).toBeGreaterThan(0);
      expect(result.tags).toContain('library');
    });

    it('should handle AI service errors', async () => {
      mockAIService.analyzeURL.mockRejectedValue(new Error('AI service error'));

      await expect(simulator.ingestURL('https://example.com')).rejects.toThrow('AI service error');
    });
  });

  describe('updateMetadataForURL', () => {
    it('should update metadata for valid URL', async () => {
      const existingResource: Partial<Resource> = {
        title: 'Old Title',
        type: 'LIBRARY',
      };

      const mockAnalysis = {
        title: 'New Title',
        type: 'API' as const,
        description: 'New description',
        command: 'npm install new-package',
      };

      mockAIService.analyzeURL.mockResolvedValue(mockAnalysis);

      const result = await simulator.updateMetadataForURL(
        'https://example.com',
        existingResource
      );

      expect(result.title).toBe('New Title');
      expect(result.type).toBe('API');
      expect(result.description).toBe('New description');
      expect(result.platforms).toContain('Node.js');
    });

    it('should return empty object for invalid URL', async () => {
      const existingResource: Partial<Resource> = {
        title: 'Old Title',
      };

      const result = await simulator.updateMetadataForURL('invalid-url', existingResource);

      expect(result).toEqual({});
    });

    it('should preserve existing values when analysis fails', async () => {
      const existingResource: Partial<Resource> = {
        title: 'Existing Title',
        type: 'LIBRARY',
      };

      mockAIService.analyzeURL.mockRejectedValue(new Error('Analysis failed'));

      const result = await simulator.updateMetadataForURL(
        'https://example.com',
        existingResource
      );

      expect(result).toEqual({});
    });

    it('should use existing values as fallback', async () => {
      const existingResource: Partial<Resource> = {
        title: 'Existing Title',
        type: 'LIBRARY',
        description: 'Existing description',
      };

      mockAIService.analyzeURL.mockResolvedValue({});

      const result = await simulator.updateMetadataForURL(
        'https://example.com',
        existingResource
      );

      expect(result.title).toBe('Existing Title');
      expect(result.type).toBe('LIBRARY');
      expect(result.description).toBe('Existing description');
    });
  });
});

