import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/config/constants';
import { useActivityStore } from '@/store/activity-store';

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

    // Auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.JWT_TOKEN) : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Response Interceptor: Unwrap data, handle global errors, end activity
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (requestToken) {
      useActivityStore.getState().end(requestToken);
      requestToken = null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data as any;
  },
  (error: AxiosError<ApiResponse>) => {
    if (requestToken) {
      useActivityStore.getState().end(requestToken);
      requestToken = null;
    }
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., trigger logout or refresh token)
      // For now, if we get 401, we might want to clear token and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
        // window.location.href = ROUTES.auth.login; // Careful with hard redirects, better handled via auth context
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
