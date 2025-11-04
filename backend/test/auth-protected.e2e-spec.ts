import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/auth/supabase.service';
import { UsersService } from '../src/auth/users.service';
import { User } from '../src/entities/user.entity';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';

describe('Auth Protected Routes (E2E)', () => {
  let app: NestFastifyApplication;
  let supabaseService: SupabaseService;
  let usersService: UsersService;

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

  const createMockSupabaseUser = (id: string, email: string): SupabaseUser => ({
    id,
    email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  });

  const createMockAuthError = (message: string): AuthError => {
    const error = new Error(message) as AuthError;
    error.name = 'AuthError';
    error.status = 401;
    return error;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/me (protected route)', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Authorization header is required');
    });

    it('should return 401 with invalid authorization header format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'InvalidFormat token',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid authorization header format');
    });

    it('should return 401 with missing token in Bearer format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid authorization header format');
    });

    it('should return 401 when token is invalid', async () => {
      const mockError = createMockAuthError('Invalid token');
      
      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid or expired token');
    });

    it('should return 401 when user exists in Supabase but not in database', async () => {
      const mockAuthUser = createMockSupabaseUser('auth-999', 'notfound@example.com');

      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer valid-but-no-db-user-token',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid or expired token');
    });

    it('should return 200 and user data with valid token', async () => {
      const mockAuthUser = createMockSupabaseUser('auth-123', 'test@example.com');
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

      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValue(mockUser);
      vi.spyOn(usersService, 'formatUserResponse').mockReturnValue(formattedUser);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(formattedUser);
    });
  });

  describe('Multiple protected routes with same token', () => {
    it('should allow access to multiple protected routes with the same valid token', async () => {
      const mockAuthUser = createMockSupabaseUser('auth-123', 'test@example.com');
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

      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValue(mockUser);
      vi.spyOn(usersService, 'formatUserResponse').mockReturnValue(formattedUser);

      const validToken = 'Bearer valid-token';

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: validToken },
      });
      expect(response1.statusCode).toBe(200);

      // Second request with same token
      const response2 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: validToken },
      });
      expect(response2.statusCode).toBe(200);

      // Both should return the same user data
      expect(JSON.parse(response1.body)).toEqual(JSON.parse(response2.body));
    });
  });

  describe('Token expiration simulation', () => {
    it('should reject requests after token becomes invalid', async () => {
      const mockAuthUser = createMockSupabaseUser('auth-123', 'test@example.com');
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

      // First, token is valid
      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValueOnce({
        data: { user: mockAuthUser },
        error: null,
      });
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValue(mockUser);
      vi.spyOn(usersService, 'formatUserResponse').mockReturnValue(formattedUser);

      const response1 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer valid-token' },
      });
      expect(response1.statusCode).toBe(200);

      // Then, token becomes invalid (expired)
      const mockError = createMockAuthError('Token expired');
      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      });

      const response2 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer valid-token' },
      });
      expect(response2.statusCode).toBe(401);
    });
  });

  describe('User state changes', () => {
    it('should reflect updated user data on subsequent requests', async () => {
      const mockAuthUser = createMockSupabaseUser('auth-123', 'test@example.com');
      
      const initialUser = { ...mockUser };
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };

      // First request - initial user data
      vi.spyOn(supabaseService.auth, 'getUser').mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValueOnce(initialUser);
      vi.spyOn(usersService, 'formatUserResponse').mockReturnValueOnce({
        ...usersService.formatUserResponse(initialUser),
      });

      const response1 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer valid-token' },
      });
      const body1 = JSON.parse(response1.body);
      expect(body1.fullName).toBe('Test User');

      // Second request - updated user data
      vi.spyOn(usersService, 'findByAuthUserId').mockResolvedValueOnce(updatedUser);
      vi.spyOn(usersService, 'formatUserResponse').mockReturnValueOnce({
        ...usersService.formatUserResponse(updatedUser),
      });

      const response2 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer valid-token' },
      });
      const body2 = JSON.parse(response2.body);
      expect(body2.fullName).toBe('Updated Name');
    });
  });
});
