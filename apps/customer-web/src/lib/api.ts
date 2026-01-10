/**
 * API Client for Nasneh Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Get the API base URL from environment variables
 * @returns API base URL with /api/v1 suffix
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Build a full API URL from a relative path
 * 
 * @param path - Relative API path (e.g., '/services', '/users/me')
 * @returns Full API URL
 * 
 * @example
 * ```ts
 * apiUrl('/services') // → 'https://api-staging.nasneh.com/api/v1/services'
 * apiUrl('/users/me') // → 'https://api-staging.nasneh.com/api/v1/users/me'
 * ```
 */
export function apiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Fetch wrapper with automatic API URL building
 * 
 * @param path - Relative API path
 * @param options - Fetch options
 * @returns Fetch response
 * 
 * @example
 * ```ts
 * const response = await apiFetch('/services');
 * const data = await response.json();
 * ```
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), options);
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
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
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
