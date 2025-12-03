/**
 * API client utility functions for making requests to Next.js API routes
 * Cookies are automatically included in requests by the browser
 */

const API_BASE = '/api';

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
    return true;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include refresh_token cookie
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
    } catch {
      throw new Error('Token refresh failed');
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  try {
    await refreshPromise;
    return true;
  } catch {
    return false;
  }
}

/**
 * Generic API request function with error handling and automatic token refresh
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies in requests
  });

  // If 401 and we haven't already retried, try to refresh token
  if (!response.ok && response.status === 401 && retryOn401) {
    // Don't try to refresh if this is already a refresh request
    if (endpoint === '/auth/refresh') {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Attempt to refresh the token
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the original request once after refresh
      return apiRequest<T>(endpoint, options, false);
    }

    // If refresh failed, throw the original error
    const errorData = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

