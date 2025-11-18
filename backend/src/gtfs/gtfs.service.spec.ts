/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { GtfsService } from './gtfs.service';
import axios from 'axios';
import JSZip from 'jszip';
import { Logger } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// Mock axios
vi.mock('axios');
// Mock JSZip
vi.mock('jszip');

describe('GtfsService', () => {
  let service: GtfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GtfsService],
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
      (axios.get as Mock).mockResolvedValue({
        status: 200,
        data: mockData,
        headers: {
          etag: 'v1',
          'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT',
        },
      });

      // Mock JSZip
      const mockZipFiles = {
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
      (JSZip.loadAsync as Mock).mockImplementation(mockLoadAsync);

      const result = await service.downloadGtfs();

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(JSZip.loadAsync).toHaveBeenCalledWith(mockData);
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
      (axios.get as Mock).mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('zip'),
        headers: { etag: 'v1' },
      });
      (JSZip.loadAsync as Mock).mockResolvedValueOnce({
        files: {
          'test.txt': {
            dir: false,
            async: vi.fn().mockResolvedValue('content'),
          },
        },
      });
      await service.downloadGtfs();

      // 2. Run 304 download
      (axios.get as Mock).mockResolvedValueOnce({
        status: 304,
        headers: {},
      });

      const result = await service.downloadGtfs();

      // Should have sent headers
      expect(axios.get).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'If-None-Match': 'v1',
          }),
        }),
      );

      // Should return existing data
      expect(result).toEqual({ 'test.txt': 'content' });
    });

    it('should handle errors gracefully', async () => {
      (axios.get as Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.downloadGtfs();
      expect(result).toBeNull();
    });

    it('should prevent concurrent downloads', async () => {
      // We need to make the first call hang or be slow
      let resolvePromise: (val: unknown) => void;
      const pendingPromise = new Promise((r) => {
        resolvePromise = r;
      });

      (axios.get as Mock).mockReturnValue(pendingPromise);

      const promise1 = service.downloadGtfs();
      const promise2 = service.downloadGtfs();

      // The second one should return null immediately
      expect(await promise2).toBeNull();

      // Resolve the first one to clean up
      resolvePromise!({ status: 200, data: Buffer.from(''), headers: {} });
      (JSZip.loadAsync as Mock).mockResolvedValue({ files: {} });

      await promise1;
    });
  });

  describe('onModuleInit', () => {
    it('should call downloadGtfs on init', async () => {
      const downloadSpy = vi
        .spyOn(service, 'downloadGtfs')
        .mockResolvedValue({});
      await service.onModuleInit();
      expect(downloadSpy).toHaveBeenCalled();
    });

    it('should catch errors during init', async () => {
      const downloadSpy = vi
        .spyOn(service, 'downloadGtfs')
        .mockRejectedValue(new Error('Init fail'));
      const errorSpy = vi.spyOn(Logger.prototype, 'error');

      await service.onModuleInit();
      expect(downloadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        'Initial GTFS load failed',
        expect.any(Error),
      );
    });
  });

  describe('handleCron', () => {
    it('should call downloadGtfs', async () => {
      const downloadSpy = vi
        .spyOn(service, 'downloadGtfs')
        .mockResolvedValue({});
      await service.handleCron();
      expect(downloadSpy).toHaveBeenCalled();
    });
  });
});
