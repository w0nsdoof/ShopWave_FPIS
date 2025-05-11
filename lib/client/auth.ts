/**
 * Authentication utilities for API requests
 */
import { clientStorage } from "./storage";

/**
 * Get the authentication token
 */
export const getAuthToken = (): string | null => {
  return clientStorage.get('token');
};

/**
 * Create authorization headers for API requests
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  
  if (token) {
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  
  return {
    "Content-Type": "application/json",
  };
};
