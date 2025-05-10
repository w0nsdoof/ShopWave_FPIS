/**
 * API utilities for handling fetch requests with consistent CORS configuration
 */

// Import environment configuration
import { API_BASE_URL, IS_DEVELOPMENT, getApiUrl as envGetApiUrl } from '../config/env';

// API URL from environment config
const API_URL = API_BASE_URL;

// Function to handle URL creation with proper handling for development vs production
const getProxyUrl = (url: string): string => {
  // If it's already an absolute URL, return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // Otherwise, use the environment-aware URL generator
  const path = url.replace(/^\/api/, ''); // Remove /api prefix if present
  return envGetApiUrl(path);
};

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
  // Only use absolute URLs if explicitly provided, otherwise use relative paths via API_URL
  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Apply proxy handling if needed (particularly for static exports)
  url = getProxyUrl(url);
  
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const token = options.token || (storedToken || undefined);
  
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
  return envGetApiUrl(path);
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