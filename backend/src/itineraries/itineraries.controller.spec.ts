import { Test, TestingModule } from '@nestjs/testing';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { AuthGuard, RequestWithUser } from '../modules/auth/auth.guard';
import { vi } from 'vitest';

describe('ItinerariesController', () => {
  let controller: ItinerariesController;

  const mockItinerariesService = {
    create: vi.fn(),
  };

  const mockAuthGuard = {
    canActivate: vi.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItinerariesController],
      providers: [
        { provide: ItinerariesService, useValue: mockItinerariesService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ItinerariesController>(ItinerariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an itinerary', async () => {
      const createItineraryDto = {
        segments: [],
        wantsToSteward: true,
      };

      const userId = 'user-uuid';
      const req = { user: { id: userId } };

      const expectedResponse = {
        id: 'itinerary-id',
        trips: [],
        stewarding: true,
      };

      mockItinerariesService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(
        req as RequestWithUser,
        createItineraryDto,
      );

      expect(mockItinerariesService.create).toHaveBeenCalledWith(
        userId,
        createItineraryDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error if user is not found in request', async () => {
      const createItineraryDto = {
        segments: [],
        wantsToSteward: true,
      };
      const req = {};

      await expect(
        controller.create(req as RequestWithUser, createItineraryDto),
      ).rejects.toThrow('User not found');
    });
  });
});
