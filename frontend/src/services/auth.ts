/**
 * Auth Service
 *
 * API call functions for authentication endpoints.
 * This is the only layer that touches the API client directly.
 */
import apiClient from '@/lib/api-client';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  TokenPair,
  User,
  RefreshTokenRequest,
} from '@/types/domain';
import type { ApiResponse } from '@/lib/api-client';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post('/auth/login', data) as ApiResponse<LoginResponse>;
    return res.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const res = await apiClient.post('/auth/register', data) as ApiResponse<User>;
    return res.data;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<TokenPair> {
    const res = await apiClient.post('/auth/refresh', data) as ApiResponse<TokenPair>;
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get('/users/me') as ApiResponse<User>;
    return res.data;
  },
};
