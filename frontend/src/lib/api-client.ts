import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/config/constants';

// The standard shape of our backend responses
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: null | {
    code: string;
    message: string;
    details?: any;
  };
}

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // In a real app, this might come from a cookie or secure store depending on auth architecture
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.JWT_TOKEN) : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap data and handle global errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // We expect the backend to return our standard ApiResponse format
    return response.data as any; // The service layer will cast this to the specific type
  },
  (error: AxiosError<ApiResponse>) => {
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
