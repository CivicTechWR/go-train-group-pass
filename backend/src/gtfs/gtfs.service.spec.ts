import { Test, TestingModule } from '@nestjs/testing';
import { GtfsService } from './gtfs.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import JSZip from 'jszip';
import { Logger } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// Mock axios
vi.mock('axios');
// Mock JSZip
vi.mock('jszip');

const mockedAxios = axios as unknown as { get: Mock };
const mockedJSZip = JSZip as unknown as { loadAsync: Mock };

describe('GtfsService', () => {
  let service: GtfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GtfsService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('https://mock-url'),
          },
        },
      ],
    }).compile();

    service = module.get<GtfsService>(GtfsService);

    // Reset mocks
    vi.clearAllMocks();
    // Silence logger for tests
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('downloadGtfs', () => {
    it('should download and extract files successfully (200)', async () => {
      // Mock axios response
      const mockData = Buffer.from('mock-zip-data');
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockData,
        headers: {
          etag: 'v1',
          'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT',
        },
      });

      // Mock JSZip
      const mockZipFiles: Record<string, unknown> = {
        'agency.txt': {
          dir: false,
          async: vi.fn().mockResolvedValue('agency_data'),
        },
        'stops.txt': {
          dir: false,
          async: vi.fn().mockResolvedValue('stops_data'),
        },
        'folder/': { dir: true },
      };

      const mockLoadAsync = vi.fn().mockResolvedValue({
        files: mockZipFiles,
      });
      mockedJSZip.loadAsync.mockImplementation(mockLoadAsync);

      const result = await service.downloadGtfs();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedJSZip.loadAsync).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({
        'agency.txt': 'agency_data',
        'stops.txt': 'stops_data',
      });

      // Verify state update
      expect(service.getLatestGtfsFiles()).toEqual({
        'agency.txt': 'agency_data',
        'stops.txt': 'stops_data',
      });
    });

    it('should handle 304 Not Modified', async () => {
      // 1. Run successful download to set initial state
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('zip'),
        headers: { etag: 'v1' },
      });
      mockedJSZip.loadAsync.mockResolvedValueOnce({
        files: {
          'test.txt': {
            dir: false,
            async: vi.fn().mockResolvedValue('content'),
          },
        },
      });
      await service.downloadGtfs();

      // 2. Run 304 download
      mockedAxios.get.mockResolvedValueOnce({
        status: 304,
        headers: {},
      });

      const result = await service.downloadGtfs();

      // Should have sent headers
      expect(mockedAxios.get).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'If-None-Match': 'v1',
          },
        }),
      );

      // Should return existing data
      expect(result).toEqual({ 'test.txt': 'content' });
    });

    it('should handle errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.downloadGtfs();
      expect(result).toBeNull();
    });

    it('should prevent concurrent downloads', async () => {
      // We need to make the first call hang or be slow
      let resolvePromise: (val: unknown) => void;
      const pendingPromise = new Promise((r) => {
        resolvePromise = r;
      });

      mockedAxios.get.mockReturnValue(pendingPromise);

      const promise1 = service.downloadGtfs();
      const promise2 = service.downloadGtfs();

      // The second one should return null immediately
      expect(await promise2).toBeNull();

      // Resolve the first one to clean up
      resolvePromise!({ status: 200, data: Buffer.from(''), headers: {} });
      mockedJSZip.loadAsync.mockResolvedValue({ files: {} });

      await promise1;
    });
  });
});
