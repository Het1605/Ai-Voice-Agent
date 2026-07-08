const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Helper to get the access token from localStorage (client-side only).
 */
const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Standard fetch wrapper that automatically attaches the Authorization header
 * and throws errors for non-2xx responses.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized globally: attempt to refresh the token
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Attempt to get a new access token
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            localStorage.setItem('access_token', newTokens.access_token);
            if (newTokens.refresh_token) {
              localStorage.setItem('refresh_token', newTokens.refresh_token);
            }
            
            // Retry the original request with the new token
            headers['Authorization'] = `Bearer ${newTokens.access_token}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        } catch (err) {
          console.error("Token refresh failed", err);
        }
      }
      
      // If refresh failed or no refresh token exists, force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMsg = response.statusText || 'An error occurred';
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Handle FastAPI validation errors
        errorMsg = data.detail.map((err: any) => err.msg).join(', ');
      } else {
        errorMsg = JSON.stringify(data.detail);
      }
    }
    throw new Error(errorMsg);
  }

  return data;
}
