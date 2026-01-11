/**
 * API Client for Nasneh Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get normalized API URL
 * 
 * Handles cases where NEXT_PUBLIC_API_URL may or may not include /api/v1
 * Prevents double /api/v1 in URLs
 * 
 * @param path - API path without /api/v1 prefix (e.g., '/services/123')
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  let baseUrl = API_BASE_URL;
  
  // Remove trailing slash from base URL
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // If base URL already ends with /api/v1, don't append it again
  if (baseUrl.endsWith('/api/v1')) {
    return `${baseUrl}${path}`;
  }
  
  // Otherwise, append /api/v1
  return `${baseUrl}/api/v1${path}`;
}

/**
 * Get full API URL with /api/v1 prefix
 * Alias for getApiUrl for clarity
 */
export function getFullApiUrl(path: string): string {
  return getApiUrl(path);
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  attemptsRemaining?: number;
}

interface RequestOtpResponse {
  expiresIn: number;
}

interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    role: string;
  };
}

/**
 * Request OTP for phone number
 */
export async function requestOtp(phone: string): Promise<ApiResponse<RequestOtpResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Verify OTP and get tokens
 */
export async function verifyOtp(phone: string, otp: string): Promise<ApiResponse<VerifyOtpResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const apiResponse = await response.json();
    
    // API returns { success, user, tokens } but frontend expects { success, data: { accessToken, refreshToken, user } }
    if (apiResponse.success && apiResponse.tokens) {
      return {
        success: true,
        data: {
          accessToken: apiResponse.tokens.accessToken,
          refreshToken: apiResponse.tokens.refreshToken,
          user: apiResponse.user,
        },
      };
    }
    
    return {
      success: false,
      error: apiResponse.message || 'Verification failed',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Logout user
 */
export async function logout(accessToken: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nasneh_access_token');
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nasneh_refresh_token');
}

/**
 * Update access token in localStorage
 */
function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nasneh_access_token', token);
}

/**
 * Authenticated fetch with auto-refresh
 * 
 * Automatically adds Authorization header and handles token refresh on 401
 */
export async function authenticatedFetch(
  url: string,
  options?: Parameters<typeof fetch>[1]
): Promise<Response> {
  const opts = options || {};
  const accessToken = getAccessToken();
  
  // First attempt with current token
  const headers = {
    ...opts.headers,
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
  };
  
  let response = await fetch(url, {
    ...opts,
    headers,
  });
  
  // If 401, try to refresh token and retry
  if (response.status === 401) {
    const refreshTokenValue = getRefreshToken();
    
    if (refreshTokenValue) {
      const refreshResponse = await refreshToken(refreshTokenValue);
      
      if (refreshResponse.success && refreshResponse.data?.accessToken) {
        // Update token in localStorage
        setAccessToken(refreshResponse.data.accessToken);
        
        // Retry original request with new token
        const newHeaders = {
          ...opts.headers,
          'Authorization': `Bearer ${refreshResponse.data.accessToken}`,
        };
        
        response = await fetch(url, {
          ...opts,
          headers: newHeaders,
        });
      }
    }
  }
  
  return response;
}
