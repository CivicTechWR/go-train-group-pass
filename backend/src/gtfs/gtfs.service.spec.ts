import { Test, TestingModule } from '@nestjs/testing';
import { GtfsService } from './gtfs.service';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
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
  let mockRepository: {
    persistAndFlush: Mock;
    removeAndFlush: Mock;
    findOne: Mock;
    find: Mock;
    flush: Mock;
    nativeDelete: Mock;
    create: Mock;
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
      create: vi.fn((data) => data), // Return the data as-is for simplicity
    };

    mockEntityManager = {
      persistAndFlush: vi.fn(),
      removeAndFlush: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      flush: vi.fn(),
      nativeDelete: vi.fn(),
      create: vi.fn((_, data) => data), // Return the data as-is for simplicity
      getRepository: vi.fn(() => mockRepository), // Return mock repository for any entity
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
        'agency.txt': 'agency_data',
        'stops.txt': 'stop_data',
      });

      // Verify state update
      expect(service.getLatestGtfsFiles()).toEqual({
        'agency.txt': 'agency_data',
        'stops.txt': 'stop_data',
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
        'agency.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone\nGO,GO Transit,https://www.gotransit.com,America/Toronto,en,1.888.438.6646',
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
              'route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible,bikes_allowed,route_variant\n08251125-61,20251110,20251110-61-61440,61 - Union Station,,1,eggoG012,414493,1,1,61',
            ),
        },
        'stop_times.txt': {
          dir: false,
          async: vi
            .fn()
            .mockResolvedValue(
              'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,stop_headsign\n20251110-61-61440,14:30:00,14:30:00,02300,22,0,0,',
            ),
        },
      };

      mockedJSZip.loadAsync.mockResolvedValue({
        files: mockZipFiles,
      });

      // Execute the import
      await service.downloadAndImportToDatabase();

      // Verify getRepository was called for each entity type
      expect(mockEntityManager.getRepository).toHaveBeenCalled();

      // Verify nativeDelete was called to clear old data (via repository)
      expect(mockRepository.nativeDelete).toHaveBeenCalledTimes(6);

      // Verify create was called with correctly parsed CSV data (via repository)
      expect(mockRepository.create).toHaveBeenCalled();

      // Check agency parsing - should have converted CSV columns to entity properties
      const agencyCalls = mockRepository.create.mock.calls.filter(
        (call) => call[0]?.agencyName !== undefined,
      );
      expect(agencyCalls.length).toBeGreaterThan(0);
      expect(agencyCalls[0][0]).toMatchObject({
        id: 'GO',
        agencyName: 'GO Transit',
        agencyUrl: 'https://www.gotransit.com',
        agencyTimezone: 'America/Toronto',
        agencyLang: 'en',
        agencyPhone: '1.888.438.6646',
      });

      // Check stops parsing - should have 2 stops
      const stopCalls = mockRepository.create.mock.calls.filter(
        (call) => call[0]?.stopName !== undefined,
      );
      expect(stopCalls.length).toBe(2);
      expect(stopCalls[0][0]).toMatchObject({
        id: 'WR',
        stopName: 'West Harbour GO',
        stopLat: 43.266775,
        stopLon: -79.866222,
      });

      // Check routes parsing - should have 1 route
      const routeCalls = mockRepository.create.mock.calls.filter(
        (call) => call[0]?.routeShortName !== undefined,
      );
      expect(routeCalls.length).toBe(1);
      expect(routeCalls[0][0]).toMatchObject({
        id: '08251125-ST',
        routeShortName: 'ST',
        routeLongName: 'Stouffville',
        routeDesc: undefined,
        routeType: 2,
        routeUrl: undefined,
        routeColor: '794500',
        routeTextColor: 'FFFFFF',
        agency: undefined,
      });

      // Check calendar dates parsing - should have 1 calendar date
      const calendarCalls = mockRepository.create.mock.calls.filter(
        (call) =>
          call[0]?.serviceId !== undefined &&
          call[0]?.date !== undefined &&
          call[0]?.exceptionType !== undefined,
      );
      expect(calendarCalls.length).toBe(1);
      expect(calendarCalls[0][0]).toMatchObject({
        serviceId: '20251121',
        date: new Date('2025-11-21T05:00:00.000Z'),
        exceptionType: 1,
      });

      // Check trips parsing - should have 1 trip
      const tripCalls = mockRepository.create.mock.calls.filter(
        (call) => call[0]?.tripHeadsign !== undefined,
      );
      expect(tripCalls.length).toBe(1);
      expect(tripCalls[0][0]).toMatchObject({
        id: '20251110-61-61440',
        calendarDate: undefined,
        tripHeadsign: '61 - Union Station',
        tripShortName: undefined,
        directionId: 1,
        blockId: 'eggoG012',
        shapeId: '414493',
        wheelchairAccessible: 1,
        bikesAllowed: 1,
        route: undefined,
      });

      // Check stop times parsing - should have 1 stop
      const stopTimesCalls = mockRepository.create.mock.calls.filter(
        (call) => call[0]?.stopSequence !== undefined,
      );
      expect(stopTimesCalls.length).toBe(1);
      expect(stopTimesCalls[0][0]).toMatchObject({
        id: '20251110-61-61440',
        stopSequence: 22,
        arrivalTime: '14:30:00',
        departureTime: '14:30:00',
        stopHeadsign: undefined,
        pickupType: 0,
        dropOffType: 0,
        shapeDistTraveled: undefined,
        timepoint: undefined,
        stop: undefined,
        trip: undefined,
      });

      // Verify persistAndFlush was called for each batch
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    });
  });
});
