const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest<T>(
  endpoint: string,
  options: globalThis.RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('dashboard_token') 
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  requestOtp: (phone: string) =>
    apiRequest('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  // User
  getMe: () => apiRequest('/users/me'),
  updateMe: (data: { name?: string; email?: string }) =>
    apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Admin - Applications
  getVendorApplications: (status?: string) =>
    apiRequest(`/admin/vendor-applications${status ? `?status=${status}` : ''}`),
  getProviderApplications: (status?: string) =>
    apiRequest(`/admin/provider-applications${status ? `?status=${status}` : ''}`),
  getVendorApplication: (id: string) =>
    apiRequest(`/admin/vendor-applications/${id}`),
  getProviderApplication: (id: string) =>
    apiRequest(`/admin/provider-applications/${id}`),
  approveVendorApplication: (id: string, notes?: string) =>
    apiRequest(`/admin/vendor-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED', notes }),
    }),
  rejectVendorApplication: (id: string, notes: string) =>
    apiRequest(`/admin/vendor-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED', notes }),
    }),
  approveProviderApplication: (id: string, notes?: string) =>
    apiRequest(`/admin/provider-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED', notes }),
    }),
  rejectProviderApplication: (id: string, notes: string) =>
    apiRequest(`/admin/provider-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED', notes }),
    }),
};
