import { Test, TestingModule } from '@nestjs/testing';
import { GtfsService, DownloadAndImportGTFSDataResult } from './gtfs.service';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import axios from 'axios';
import JSZip from 'jszip';
import { Logger } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import {
  Agency,
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSCalendarDate,
} from '../entities';
import { GTFSFeedInfo } from '../entities/gtfs_feed_info.entity';

// Mock axios
vi.mock('axios');
// Mock JSZip
vi.mock('jszip');

// Mock CreateRequestContext to do nothing in tests
vi.mock('@mikro-orm/postgresql', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mikro-orm/postgresql')>();
  return {
    ...actual,
    CreateRequestContext:
      () =>
      (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) =>
        descriptor,
  };
});

const mockedAxios = axios as unknown as { get: Mock };
const mockedJSZip = JSZip as unknown as { loadAsync: Mock };

describe('GtfsService', () => {
  let service: GtfsService;
  let mockRepository: {
    persistAndFlush: Mock;
    removeAndFlush: Mock;
    findOne: Mock;
    find: Mock;
    flush: Mock;
    nativeDelete: Mock;
    create: Mock;
    getReference: Mock;
    getEntityManager: Mock<() => { persistAndFlush: Mock }>;
    insertMany: Mock;
  };
  let mockEntityManager: {
    persistAndFlush: Mock;
    removeAndFlush: Mock;
    findOne: Mock;
    find: Mock;
    flush: Mock;
    nativeDelete: Mock;
    create: Mock;
    getRepository: Mock;
  };

  beforeEach(async () => {
    mockRepository = {
      persistAndFlush: vi.fn(),
      removeAndFlush: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      flush: vi.fn(),
      nativeDelete: vi.fn(),
      create: vi.fn((data: Record<string, unknown>) => ({
        ...data,
        id: 'mock-id',
      })),
      getReference: vi.fn((id: string) => ({ id })),
      getEntityManager: vi.fn().mockReturnValue({
        persistAndFlush: vi.fn(),
      }),
      insertMany: vi.fn(),
    };

    mockEntityManager = {
      persistAndFlush: vi.fn(),
      removeAndFlush: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      flush: vi.fn(),
      nativeDelete: vi.fn(),
      create: vi.fn((_, data: Record<string, unknown>) => data),
      getRepository: vi.fn(() => mockRepository),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GtfsService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('https://mock-url'),
          },
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        { provide: getRepositoryToken(Agency), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSRoute), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSStop), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSTrip), useValue: mockRepository },
        { provide: getRepositoryToken(GTFSStopTime), useValue: mockRepository },
        {
          provide: getRepositoryToken(GTFSCalendarDate),
          useValue: mockRepository,
        },
        { provide: getRepositoryToken(GTFSFeedInfo), useValue: mockRepository },
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
          async: vi.fn().mockResolvedValue('stop_data'),
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
        'agency.txt': expect.stringContaining('agency.txt') as unknown,
        'stops.txt': expect.stringContaining('stops.txt') as unknown,
      });

      // Verify state update
      expect(service.getLatestGtfsFiles()).toEqual({
        'agency.txt': expect.stringContaining('agency.txt') as unknown,
        'stops.txt': expect.stringContaining('stops.txt') as unknown,
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
      expect(result).toEqual({
        'test.txt': expect.stringContaining('test.txt') as unknown,
      });
    });

    it('should handle errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.downloadGtfs();
      expect(result).toEqual({});
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

  describe('downloadAndImportToDatabase', () => {
    it('should parse CSV files and persist entities correctly', async () => {
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

      // Mock JSZip with realistic GTFS CSV data
      const mockZipFiles: Record<string, unknown> = {
        'feed_info.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version\nGO Transit,http://www.gotransit.com,en,20251121,20261121,1.0',
            ),
        },
        'agency.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url\nGO,GO Transit,https://www.gotransit.com,America/Toronto,en,1.888.438.6646,http://example.com',
            ),
        },
        'stops.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'stop_id,stop_name,stop_lat,stop_lon,location_type,parent_station\nWR,West Harbour GO,43.266775,-79.866222,0,\nBD,Burlington GO,43.3397,-79.7877,0,',
            ),
        },
        'routes.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color\n08251125-ST,GO,ST,Stouffville,2,794500,FFFFFF',
            ),
        },
        'calendar_dates.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'service_id,date,exception_type\n20251121,20251121,1',
            ),
        },
        'trips.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed,route_variant\n08251125-ST,20251121,20251110-61-61440,61 - Union Station,,1,eggoG012,414493,1,1,61',
            ),
        },
        'stop_times.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign\n20251110-61-61440,14:30:00,14:30:00,WR,22,0,0,',
            ),
        },
      };

      mockedJSZip.loadAsync.mockResolvedValue({
        files: mockZipFiles,
      });

      // Mock feedInfoRepository.findOne to return null (new feed)
      mockRepository.findOne.mockResolvedValue(null);

      // Execute the import
      const result = await service.downloadAndImportToDatabase();

      expect(result).toBe(DownloadAndImportGTFSDataResult.FEED_UPDATED);

      // Verify create was called for FeedInfo
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          feedVersion: '1.0',
          feedPublisherName: 'GO Transit',
        }),
      );

      // Verify persistAndFlush was called for the new feed
      expect(
        mockRepository.getEntityManager().persistAndFlush,
      ).toHaveBeenCalled();

      // Verify create was called for other entities
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          agencyName: 'GO Transit',
        }),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stopName: 'West Harbour GO',
        }),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          routeShortName: 'ST',
        }),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: '20251121',
        }),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tripHeadsign: '61 - Union Station',
        }),
      );

      // StopTimes use insertMany
      expect(mockRepository.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            stopSequence: 22,
            arrivalTime: '14:30:00',
          }),
        ]),
      );
    });

    it('should skip import if feed version already exists and is active', async () => {
      // Mock axios response
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: Buffer.from('mock-zip-data'),
        headers: {},
      });

      // Mock JSZip
      mockedJSZip.loadAsync.mockResolvedValue({
        files: {
          'feed_info.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version\nGO Transit,http://www.gotransit.com,en,20251121,20261121,1.0',
              ),
          },
          // Other files are needed for validation but won't be imported
          'agency.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url\nGO,GO Transit,https://www.gotransit.com,America/Toronto,en,1.888.438.6646,http://example.com',
              ),
          },
          'stops.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'stop_id,stop_name,stop_lat,stop_lon,location_type,parent_station\nWR,West Harbour GO,43.266775,-79.866222,0,',
              ),
          },
          'routes.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color\n08251125-ST,GO,ST,Stouffville,2,794500,FFFFFF',
              ),
          },
          'calendar_dates.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'service_id,date,exception_type\n20251121,20251121,1',
              ),
          },
          'trips.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed,route_variant\n08251125-ST,20251121,20251110-61-61440,61 - Union Station,,1,eggoG012,414493,1,1,61',
              ),
          },
          'stop_times.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign\n20251110-61-61440,14:30:00,14:30:00,WR,22,0,0,',
              ),
          },
        },
      });

      // Mock feedInfoRepository.findOne to return existing active feed
      mockRepository.findOne.mockResolvedValue({
        id: 'existing-feed-id',
        feedVersion: '1.0',
        isActive: true,
      });

      const result = await service.downloadAndImportToDatabase();

      expect(result).toBe(DownloadAndImportGTFSDataResult.FEED_EXISTS);
      // Should NOT create new feed
      expect(mockRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ feedVersion: '1.0' }),
      );
    });

    it('should re-import if feed version exists but is inactive', async () => {
      // Mock axios response
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: Buffer.from('mock-zip-data'),
        headers: {},
      });

      // Mock JSZip
      mockedJSZip.loadAsync.mockResolvedValue({
        files: {
          'feed_info.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version\nGO Transit,http://www.gotransit.com,en,20251121,20261121,1.0',
              ),
          },
          'agency.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url\nGO,GO Transit,https://www.gotransit.com,America/Toronto,en,1.888.438.6646,http://example.com',
              ),
          },
          'stops.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'stop_id,stop_name,stop_lat,stop_lon,location_type,parent_station\nWR,West Harbour GO,43.266775,-79.866222,0,',
              ),
          },
          'routes.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color\n08251125-ST,GO,ST,Stouffville,2,794500,FFFFFF',
              ),
          },
          'calendar_dates.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'service_id,date,exception_type\n20251121,20251121,1',
              ),
          },
          'trips.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed,route_variant\n08251125-ST,20251121,20251110-61-61440,61 - Union Station,,1,eggoG012,414493,1,1,61',
              ),
          },
          'stop_times.txt': {
            dir: false,
            async: vi
              .fn()
              .mockResolvedValue(
                'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign\n20251110-61-61440,14:30:00,14:30:00,WR,22,0,0,',
              ),
          },
        },
      });

      // Mock feedInfoRepository.findOne to return existing INACTIVE feed
      const existingFeed = {
        id: 'existing-feed-id',
        feedVersion: '1.0',
        isActive: false,
      };
      mockRepository.findOne.mockResolvedValue(existingFeed);

      const result = await service.downloadAndImportToDatabase();

      expect(result).toBe(DownloadAndImportGTFSDataResult.FEED_UPDATED);

      // Should delete the old feed
      expect(mockRepository.nativeDelete).toHaveBeenCalledWith(existingFeed);

      // Should create new feed
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ feedVersion: '1.0' }),
      );
    });
  });
});
