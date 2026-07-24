/**
 * Auth Hooks
 *
 * React Query hooks for authentication operations.
 *
 * Dependency flow:
 *   Component → useAuth → authService → apiClient → Backend
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import type { LoginRequest, RegisterRequest } from '@/types/domain';

// ─── Query Keys ──────────────────────────────────────────────────────────

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────

/** Fetch the current user profile. Used on app load and after login. */
export function useCurrentUser() {
  const { accessToken, setUser } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    retry: 1,
    staleTime: 1000 * 60 * 5,    // 5 minutes — data is fresh
    gcTime: 1000 * 60 * 30,      // 30 minutes — cache persists
    refetchInterval: 1000 * 60 * 25, // proactively re-verify before token expiry (30 min)
    meta: { persist: true },
  });
}

/** Register a new user account. */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
}

/** Log in and persist tokens. */
export function useLogin() {
  const queryClient = useQueryClient();
  const { setTokens, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setTokens(response.tokens);
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/** Log out — clears tokens and cached queries. */
export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

/** Refresh the access token. */
export function useRefreshToken() {
  const { refreshToken, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) throw new Error('No refresh token available');
      const tokens = await authService.refreshToken({ refresh_token: refreshToken });
      setTokens(tokens);
      return tokens;
    },
  });
}
