/**
 * Auth Context
 *
 * Provides authentication state to the entire component tree.
 * Handles session restoration on app load.
 *
 * Dependency flow:
 *   Component → AuthContext → useAuth hooks → authService → apiClient → Backend
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentUser, useLogin, useLogout, useRegister } from '@/hooks/use-auth';
import type { LoginRequest, RegisterRequest } from '@/types/domain';
import { ROUTES } from '@/config/constants';

// ─── Context Shape ───────────────────────────────────────────────────────

interface AuthContextValue {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the session is being restored on initial load */
  isRestoring: boolean;
  /** Whether the auth query is currently loading */
  isLoading: boolean;
  /** The current user, or null */
  user: ReturnType<typeof useAuthStore.getState>['user'];

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isRestoring, setRestoring, clearAuth } =
    useAuthStore();

  // Session restoration: fetch current user if we have a stored token
  const {
    data: currentUser,
    isLoading,
    isError,
  } = useCurrentUser();

  // Mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Mark session restoration as complete once the query settles
  useEffect(() => {
    if (!isRestoring) return;
    if (!accessToken) {
      // No stored token — nothing to restore
      setRestoring(false);
      return;
    }
    if (!isLoading && (currentUser || isError)) {
      setRestoring(false);
    }
  }, [isRestoring, accessToken, isLoading, currentUser, isError, setRestoring]);

  // Clear auth if the stored token is invalid
  useEffect(() => {
    if (!isRestoring && isError && accessToken) {
      clearAuth();
    }
  }, [isRestoring, isError, accessToken, clearAuth]);

  // ─── Actions ──────────────────────────────────────────────────────────

  const login = useCallback(
    async (data: LoginRequest) => {
      await loginMutation.mutateAsync(data);
      router.push(ROUTES.client.dashboard);
    },
    [loginMutation, router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await registerMutation.mutateAsync(data);
      router.push(ROUTES.auth.login);
    },
    [registerMutation, router]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    router.push(ROUTES.auth.login);
  }, [logoutMutation, router]);

  // ─── Value ────────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      isRestoring,
      isLoading,
      user: user ?? currentUser ?? null,
      login,
      register,
      logout,
    }),
    [user, isRestoring, isLoading, currentUser, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
