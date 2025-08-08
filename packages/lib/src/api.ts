import { ApiResponse } from '@pcanalys/types';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T>(url: string, data: any) => 
    apiRequest<T>(url, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  put: <T>(url: string, data: any) => 
    apiRequest<T>(url, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};
