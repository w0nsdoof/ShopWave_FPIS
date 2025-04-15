/**
 * API utilities for handling fetch requests with consistent CORS configuration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions {
  method?: string;
  token?: string;
  body?: any;
  includeCredentials?: boolean;
}

/**
 * Creates standardized fetch options with proper CORS handling
 */
export function createFetchOptions({
  method = "GET",
  token,
  body,
  includeCredentials = false
}: FetchOptions = {}): RequestInit {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    // Only include credentials when explicitly requested
    credentials: includeCredentials ? "include" : "same-origin",
    // Explicitly use CORS mode
    mode: "cors",
  };

  // Add authorization token if provided
  if (token) {
    options.headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    };
  }

  // Add body if provided
  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * Performs a fetch request with standardized options
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const token = options.token || localStorage.getItem("token") || undefined;
  
  const fetchOptions = createFetchOptions({
    ...options,
    token,
  });

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Helper to get the full API URL
 */
export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

/**
 * Get the authentication token
 */
export function getAuthToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem("token") : null;
}

/**
 * Set the authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem("token", token);
  }
}

/**
 * Clear the authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
  }
}