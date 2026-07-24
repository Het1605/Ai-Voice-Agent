/**
 * Auth Service Tests
 *
 * Tests the service layer with a mocked apiClient.
 * Validates request construction, response unwrapping, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiClient before importing authService
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('@/lib/api-client', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { authService } from '@/services/auth';
import type { LoginRequest, RegisterRequest } from '@/types/domain';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService', () => {
  const mockLoginResponse = {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      is_active: true,
      is_superuser: false,
      is_verified: true,
      role: 'user',
      last_login_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    tokens: {
      access_token: 'access_token_123',
      refresh_token: 'refresh_token_456',
      token_type: 'bearer',
    },
  };

  describe('login', () => {
    it('sends a POST request to /auth/login', async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      const data: LoginRequest = { email: 'jane@example.com', password: 'TestPass1' };
      await authService.login(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', data);
    });

    it('returns the login response with user and tokens', async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      const data: LoginRequest = { email: 'jane@example.com', password: 'TestPass1' };
      const result = await authService.login(data);

      expect(result.user.email).toBe('jane@example.com');
      expect(result.tokens.access_token).toBe('access_token_123');
      expect(result.tokens.token_type).toBe('bearer');
    });

    it('re-throws errors from the API client', async () => {
      const apiError = new Error('Network error');
      mockPost.mockRejectedValueOnce(apiError);

      const data: LoginRequest = { email: 'jane@example.com', password: 'TestPass1' };
      await expect(authService.login(data)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    const mockUserResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      is_active: true,
      is_superuser: false,
      is_verified: false,
      role: 'user',
      last_login_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    it('sends a POST request to /auth/register', async () => {
      mockPost.mockResolvedValueOnce(mockUserResponse);

      const data: RegisterRequest = {
        email: 'jane@example.com',
        password: 'StrongPass1',
        first_name: 'Jane',
        last_name: 'Smith',
      };
      await authService.register(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', data);
    });

    it('returns the created user', async () => {
      mockPost.mockResolvedValueOnce(mockUserResponse);

      const data: RegisterRequest = { email: 'jane@example.com', password: 'StrongPass1' };
      const result = await authService.register(data);

      expect(result.email).toBe('jane@example.com');
      expect(result.is_active).toBe(true);
    });

    it('handles minimal registration data', async () => {
      mockPost.mockResolvedValueOnce(mockUserResponse);

      const data: RegisterRequest = { email: 'jane@example.com', password: 'StrongPass1' };
      const result = await authService.register(data);

      expect(result.email).toBe('jane@example.com');
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      is_active: true,
      is_superuser: false,
      is_verified: true,
      role: 'user',
      last_login_at: '2026-07-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    };

    it('sends a GET request to /users/me', async () => {
      mockGet.mockResolvedValueOnce(mockUser);

      await authService.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/users/me');
    });

    it('returns the current user', async () => {
      mockGet.mockResolvedValueOnce(mockUser);

      const result = await authService.getCurrentUser();

      expect(result.email).toBe('jane@example.com');
      expect(result.role).toBe('user');
    });
  });

  describe('refreshToken', () => {
    const mockTokenPair = {
      access_token: 'new_access_789',
      refresh_token: 'new_refresh_012',
      token_type: 'bearer',
    };

    it('sends a POST request to /auth/refresh', async () => {
      mockPost.mockResolvedValueOnce(mockTokenPair);

      await authService.refreshToken({ refresh_token: 'old_token' });

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'old_token',
      });
    });

    it('returns the new token pair', async () => {
      mockPost.mockResolvedValueOnce(mockTokenPair);

      const result = await authService.refreshToken({
        refresh_token: 'old_token',
      });

      expect(result.access_token).toBe('new_access_789');
      expect(result.token_type).toBe('bearer');
    });
  });

  describe('logout', () => {
    it('sends a POST request to /auth/logout', async () => {
      mockPost.mockResolvedValueOnce(undefined);

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    });

    it('resolves without error on success', async () => {
      mockPost.mockResolvedValueOnce(undefined);

      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });
});