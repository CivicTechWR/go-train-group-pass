import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto, UsersService } from './users.service';
import { User } from '../entities/user.entity';

interface MockEntityManager {
  findOne: Mock;
  create: Mock;
  persistAndFlush: Mock;
  flush: Mock;
}

describe('UsersService', () => {
  let service: UsersService;
  let mockEntityManager: MockEntityManager;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    authUserId: 'auth-123',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
    avatarUrl: undefined,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastSignInAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    // Create fresh mocks for each test
    mockEntityManager = {
      findOne: vi.fn(),
      create: vi.fn(),
      persistAndFlush: vi.fn(),
      flush: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: EntityManager,
          useValue: mockEntityManager as unknown as EntityManager,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByAuthUserId', () => {
    it('should find a user by auth user ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser);

      const result = await service.findByAuthUserId('auth-123');

      expect(result).toEqual(mockUser);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        authUserId: 'auth-123',
      });
      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null if user is not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await service.findByAuthUserId('non-existent-id');

      expect(result).toBeNull();
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        authUserId: 'non-existent-id',
      });
    });
  });

  describe('findOrCreate', () => {
    const supabaseUser: CreateUserDto = {
      authUserId: 'auth-456',
      email: 'new@example.com',
      fullName: 'New User',
      phoneNumber: '+9876543210',
    };

    it('should return existing user if found', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser);

      const result = await service.findOrCreate(supabaseUser);

      expect(result).toEqual(mockUser);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        authUserId: supabaseUser.authUserId,
      });
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      const newUser = {
        ...mockUser,
        authUserId: supabaseUser.authUserId,
        email: supabaseUser.email,
        fullName: supabaseUser.fullName,
        phoneNumber: supabaseUser.phoneNumber,
      };
      
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.create.mockReturnValue(newUser);

      const result = await service.findOrCreate(supabaseUser);

      expect(mockEntityManager.create).toHaveBeenCalledWith(User, {
        email: supabaseUser.email,
        authUserId: supabaseUser.authUserId,
        fullName: supabaseUser.fullName,
        phoneNumber: supabaseUser.phoneNumber,
        isActive: true,
        lastSignInAt: newUser.lastSignInAt,
      });
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should handle missing user_metadata gracefully', async () => {
      const minimalSupabaseUser = {
        authUserId: 'auth-minimal',
        email: 'minimal@example.com',
        user_metadata: {},
      };

      const newUser = {
        ...mockUser,
        authUserId: minimalSupabaseUser.authUserId,
        email: minimalSupabaseUser.email,
        fullName: undefined,
        phoneNumber: undefined,
        avatarUrl: undefined,
      };

      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.create.mockReturnValue(newUser);

      const result = await service.findOrCreate(minimalSupabaseUser);

      expect(mockEntityManager.create).toHaveBeenCalledWith(User, {
        email: minimalSupabaseUser.email,
        authUserId: minimalSupabaseUser.authUserId,
        fullName: undefined,
        phoneNumber: undefined,
        avatarUrl: undefined,
        isActive: true,
        lastSignInAt: mockUser.lastSignInAt,
      });
      expect(result).toEqual(newUser);
    });

    it('should handle null user_metadata', async () => {
      const userWithoutMetadata = {
        authUserId: 'auth-no-meta',
        email: 'nometa@example.com',
      };

      const newUser = {
        ...mockUser,
        authUserId: userWithoutMetadata.authUserId,
        email: userWithoutMetadata.email,
      };

      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.create.mockReturnValue(newUser);

      await service.findOrCreate(userWithoutMetadata);

      expect(mockEntityManager.create).toHaveBeenCalledWith(User, {
        email: userWithoutMetadata.email,
        authUserId: userWithoutMetadata.authUserId,
        fullName: undefined,
        phoneNumber: undefined,
        avatarUrl: undefined,
        isActive: true,
        lastSignInAt: undefined,
      });
    });
  });

  describe('create', () => {
    it('should create a new user with all fields', async () => {
      const createUserDto = {
        email: 'new@example.com',
        authUserId: 'auth-789',
        fullName: 'New User',
        phoneNumber: '+1111111111',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const newUser = { ...mockUser, ...createUserDto };
      mockEntityManager.create.mockReturnValue(newUser);

      const result = await service.create(createUserDto);

      expect(mockEntityManager.create).toHaveBeenCalledWith(User, {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        phoneNumber: createUserDto.phoneNumber,
        avatarUrl: createUserDto.avatarUrl,
        authUserId: createUserDto.authUserId,
        lastSignInAt: mockUser.lastSignInAt,
        isActive: false,
      });
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    // it('should handle optional fields', async () => {
    //   const createUserDto = {
    //     email: 'minimal@example.com',
    //     authUserId: 'auth-999',
    //   };
    //   const newUser = { ...mockUser, ...createUserDto };
    //   mockEntityManager.create.mockReturnValue(newUser);

    //   await service.create(newUser);

    //   expect(mockEntityManager.create).toHaveBeenCalledWith(User, {
    //     email: createUserDto.email,
    //     fullName: undefined,
    //     phoneNumber: undefined,
    //     avatarUrl: undefined,
    //     authUserId: createUserDto.authUserId,
    //     lastSignInAt: newUser.lastSignInAt,
    //     isActive: false,
    //   });
    // });

    it('should set lastSignInAt to current date', async () => {
      const createUserDto = {
        email: 'test@example.com',
        authUserId: 'auth-123',
      };
      const beforeCreate = new Date();
      
      mockEntityManager.create.mockReturnValue(mockUser);
      await service.create(createUserDto);

      const afterCreate = new Date();
      const callArgs = mockEntityManager.create.mock.calls[0][1];
      
      expect(callArgs.lastSignInAt).toBeInstanceOf(Date);
      expect(callArgs.lastSignInAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(callArgs.lastSignInAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('updateLastSignIn', () => {
    it('should update last sign in timestamp', async () => {
      const userId = 'test-user-id';
      const userToUpdate = { ...mockUser };
      const oldSignInTime = userToUpdate.lastSignInAt;
      
      mockEntityManager.findOne.mockResolvedValue(userToUpdate);

      // Wait a tiny bit to ensure timestamp differs
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await service.updateLastSignIn(userId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        id: userId,
      });
      expect(userToUpdate.lastSignInAt).toBeInstanceOf(Date);
      expect(userToUpdate.lastSignInAt?.getTime()).toBeGreaterThanOrEqual(oldSignInTime!.getTime());
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.updateLastSignIn('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateLastSignIn('non-existent-id')).rejects.toThrow(
        'User with ID non-existent-id not found',
      );
      expect(mockEntityManager.flush).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('test-user-id');

      expect(result).toEqual(mockUser);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        id: 'test-user-id',
      });
      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null if user is not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        id: 'non-existent-id',
      });
    });
  });

  describe('formatUserResponse', () => {
    it('should format user data for API response', () => {
      const formatted = service.formatUserResponse(mockUser);

      expect(formatted).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        phoneNumber: mockUser.phoneNumber,
        avatarUrl: mockUser.avatarUrl,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        lastSignInAt: mockUser.lastSignInAt,
      });
    });

    it('should handle undefined optional fields', () => {
      const userWithUndefined = {
        ...mockUser,
        fullName: undefined,
        phoneNumber: undefined,
        avatarUrl: undefined,
        lastSignInAt: undefined,
      };

      const formatted = service.formatUserResponse(userWithUndefined as User);

      expect(formatted).toEqual({
        id: userWithUndefined.id,
        email: userWithUndefined.email,
        fullName: undefined,
        phoneNumber: undefined,
        avatarUrl: undefined,
        isActive: userWithUndefined.isActive,
        createdAt: userWithUndefined.createdAt,
        lastSignInAt: undefined,
      });
    });

    it('should not include internal fields', () => {
      const formatted = service.formatUserResponse(mockUser);

      expect(formatted).not.toHaveProperty('authUserId');
      expect(formatted).not.toHaveProperty('updatedAt');
    });

    it('should handle user with all fields populated', () => {
      const fullUser = {
        ...mockUser,
        fullName: 'Full Name',
        phoneNumber: '+1234567890',
        avatarUrl: 'https://example.com/avatar.jpg',
        lastSignInAt: new Date('2024-01-15'),
      };

      const formatted = service.formatUserResponse(fullUser as User);

      expect(formatted.fullName).toBe('Full Name');
      expect(formatted.phoneNumber).toBe('+1234567890');
      expect(formatted.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(formatted.lastSignInAt).toEqual(new Date('2024-01-15'));
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent findOrCreate calls for same user', async () => {
      const supabaseUser = {
        authUserId: 'auth-concurrent',
        email: 'concurrent@example.com',
        user_metadata: {},
      };

      // First call finds nothing
      mockEntityManager.findOne.mockResolvedValueOnce(null);
      mockEntityManager.create.mockReturnValueOnce({ ...mockUser, authUserId: supabaseUser.authUserId });

      // Second call finds the newly created user
      mockEntityManager.findOne.mockResolvedValueOnce({ ...mockUser, authUserId: supabaseUser.authUserId });

      const result1 = await service.findOrCreate(supabaseUser);
      const result2 = await service.findOrCreate(supabaseUser);

      expect(mockEntityManager.create).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);
      expect(result1.authUserId).toBe(supabaseUser.authUserId);
      expect(result2.authUserId).toBe(supabaseUser.authUserId);
    });
  });
});
