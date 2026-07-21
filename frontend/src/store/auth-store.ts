/**
 * Auth Store
 *
 * Manages authentication state: JWT tokens and current user.
 * This store is the single source of truth for auth state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TokenPair } from '@/types/domain';
import { STORAGE_KEYS } from '@/config/constants';

interface AuthState {
  /** Current authenticated user — null when not logged in */
  user: User | null;
  /** JWT access token */
  accessToken: string | null;
  /** JWT refresh token */
  refreshToken: string | null;
  /** Whether the user's session is being restored (e.g. on app load) */
  isRestoring: boolean;

  // Actions
  setTokens: (tokens: TokenPair) => void;
  setUser: (user: User) => void;
  setRestoring: (restoring: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isRestoring: true,

      setTokens: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }),

      setUser: (user) => set({ user }),

      setRestoring: (isRestoring) => set({ isRestoring }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: STORAGE_KEYS.JWT_TOKEN,
      // Only persist tokens — user data is fetched fresh on each session
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
