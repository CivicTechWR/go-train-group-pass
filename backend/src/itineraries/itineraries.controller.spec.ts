import { Test, TestingModule } from '@nestjs/testing';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { AuthGuard } from '../modules/auth/auth.guard';
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
});
