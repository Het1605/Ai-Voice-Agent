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
export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data) as LoginResponse;
    return response;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post('/auth/register', data) as User;
    return response;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<TokenPair> {
    const response = await apiClient.post('/auth/refresh', data) as TokenPair;
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me') as User;
    return response;
  },
};
