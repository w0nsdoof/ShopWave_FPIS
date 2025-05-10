/**
 * Environment configuration for the application
 * - Contains backend API URL and other environment settings
 * - Used to handle mixed content issues between HTTPS frontend and HTTP backend
 */

// API Base URL - Override with NEXT_PUBLIC_API_URL env variable if needed
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://131.189.96.66/api';  // Using the new server

// Development mode check
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Production mode check
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// When running locally, we can use relative paths with rewrites
// When deployed as static export, we need to use CORS proxy or external service
export const getApiUrl = (path: string): string => {
  // In development, use relative paths that will be handled by Next.js rewrites
  if (IS_DEVELOPMENT) {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  // In production with static export, we need direct URL to backend
  // This might cause mixed content issues if frontend is HTTPS and backend is HTTP
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
