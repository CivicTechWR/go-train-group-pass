import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

interface MockSupabaseAuth {
  getUser: Mock;
}

interface MockUsersService {
  findByAuthUserId: Mock;
  formatUserResponse: Mock;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockSupabaseAuth: MockSupabaseAuth;
  let mockSupabaseService: { auth: MockSupabaseAuth };
  let mockUsersService: MockUsersService;

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
  } as User;

  beforeEach(async () => {
    // Create fresh mocks for each test
    mockSupabaseAuth = {
      getUser: vi.fn(),
    };

    mockSupabaseService = {
      auth: mockSupabaseAuth,
    };

    mockUsersService = {
      findByAuthUserId: vi.fn(),
      formatUserResponse: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService as unknown as SupabaseService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService as unknown as UsersService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  interface RequestWithUser {
    headers: {
      authorization?: string;
    };
    user?: {
      id: string;
      email: string;
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      isActive: boolean;
      createdAt: Date;
      lastSignInAt?: Date;
    };
  }

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    const mockRequest: RequestWithUser = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access with valid token and existing user', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const mockAuthUser = { id: 'auth-123', email: 'test@example.com' };
      const formattedUser = {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        phoneNumber: mockUser.phoneNumber,
        avatarUrl: mockUser.avatarUrl,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        lastSignInAt: mockUser.lastSignInAt,
      };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockUsersService.findByAuthUserId.mockResolvedValue(mockUser);
      mockUsersService.formatUserResponse.mockReturnValue(formattedUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledWith('valid-token');
      expect(mockUsersService.findByAuthUserId).toHaveBeenCalledWith('auth-123');
      expect(mockUsersService.formatUserResponse).toHaveBeenCalledWith(mockUser);

      const request = context.switchToHttp().getRequest() as RequestWithUser;
      expect(request.user).toEqual(formattedUser);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Authorization header is required');
    });

    it('should throw UnauthorizedException with invalid authorization header format (no Bearer)', async () => {
      const context = createMockExecutionContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException with invalid authorization header format (missing token)', async () => {
      const context = createMockExecutionContext('Bearer');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException with only whitespace after Bearer', async () => {
      const context = createMockExecutionContext('Bearer   ');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException when Supabase returns error', async () => {
      const context = createMockExecutionContext('Bearer invalid-token');

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException when Supabase returns no user', async () => {
      const context = createMockExecutionContext('Bearer expired-token');

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException when user not found in database', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const mockAuthUser = { id: 'auth-456', email: 'notfound@example.com' };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockUsersService.findByAuthUserId.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
      expect(mockUsersService.findByAuthUserId).toHaveBeenCalledWith('auth-456');
    });

    it('should handle Supabase service throwing error', async () => {
      const context = createMockExecutionContext('Bearer error-token');

      mockSupabaseAuth.getUser.mockRejectedValue(new Error('Service error'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should handle UsersService throwing error', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const mockAuthUser = { id: 'auth-123', email: 'test@example.com' };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockUsersService.findByAuthUserId.mockRejectedValue(new Error('Database error'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should attach user to request object', async () => {
      const context = createMockExecutionContext('Bearer valid-token');
      const mockAuthUser = { id: 'auth-123', email: 'test@example.com' };
      const formattedUser = {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        phoneNumber: mockUser.phoneNumber,
        avatarUrl: mockUser.avatarUrl,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        lastSignInAt: mockUser.lastSignInAt,
      };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockUsersService.findByAuthUserId.mockResolvedValue(mockUser);
      mockUsersService.formatUserResponse.mockReturnValue(formattedUser);

      await guard.canActivate(context);

      const request = context.switchToHttp().getRequest() as RequestWithUser;
      expect(request.user).toBeDefined();
      expect(request.user).toEqual(formattedUser);
    });

    it('should correctly extract token from Bearer header', async () => {
      const context = createMockExecutionContext('Bearer my-secret-token-123');
      const mockAuthUser = { id: 'auth-123', email: 'test@example.com' };
      const formattedUser = {
        id: mockUser.id,
        email: mockUser.email,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
      };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      mockUsersService.findByAuthUserId.mockResolvedValue(mockUser);
      mockUsersService.formatUserResponse.mockReturnValue(formattedUser);

      await guard.canActivate(context);

      // Verify the token was extracted correctly (without 'Bearer ' prefix)
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledWith('my-secret-token-123');
    });
  });
});
