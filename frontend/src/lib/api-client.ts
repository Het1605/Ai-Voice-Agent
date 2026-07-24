import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/config/constants';
import { useActivityStore } from '@/store/activity-store';
import { useAuthStore } from '@/store/auth-store';

// ─── Token Refresh ──────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

// The standard shape of our backend responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: null | {
    code: string;
    message: string;
    details?: unknown;
  };
}

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Activity Tracking ─────────────────────────────────────────────────────────
// Track active API requests via the activity store for the GlobalLoader.
// Each request increments on start, decrements on completion/failure.
//
// We use a module-level Set so the store is only imported on the client.

let requestToken: string | null = null;

// Request Interceptor: Attach JWT Token + track activity
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Track activity
    if (typeof window !== 'undefined') {
      requestToken = useActivityStore.getState().begin();
    }

    // Auth token — read from auth store (Zustand persist) , not raw localStorage
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    if (requestToken) {
      useActivityStore.getState().end(requestToken);
      requestToken = null;
    }
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwrap standardized envelope, handle global errors, end activity
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (requestToken) {
      useActivityStore.getState().end(requestToken);
      requestToken = null;
    }
    // Standardized envelope: { success: true, data: X }
    // Unwrap to just the inner payload so services receive X directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = response.data as any;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      return body.data;
    }
    return body;
  },
  async (error: AxiosError<ApiResponse>) => {
    if (requestToken) {
      useActivityStore.getState().end(requestToken);
      requestToken = null;
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401, if we haven't already retried,
    // and if we have a refresh token available
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      const { refreshToken: storedRefreshToken } = useAuthStore.getState();
      if (storedRefreshToken) {
        if (isRefreshing) {
          // Queue this request until the refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(apiClient(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
            `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: storedRefreshToken },
          );

          const { access_token, refresh_token } = data.data;
          useAuthStore.getState().setTokens({
            access_token,
            refresh_token,
            token_type: 'bearer',
          });

          processQueue(null, access_token);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed — clear auth
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token — just clear auth
        useAuthStore.getState().clearAuth();
      }
    }

    // Normalize error for the service layer
    const standardError = error.response?.data?.error || {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    };

    return Promise.reject(standardError);
  }
);

export default apiClient;
