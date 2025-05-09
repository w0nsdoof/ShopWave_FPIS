/**
 * Utility functions for handling API errors consistently across the application
 */
import { toast } from "@/hooks/use-toast";

interface ApiErrorOptions {
  /**
   * Custom error message to display when the API call fails
   */
  customMessage?: string;
  
  /**
   * Whether to display a toast notification
   * @default true
   */
  showToast?: boolean;
  
  /**
   * Additional details about the error (only for logging, not displayed)
   */
  details?: any;
}

/**
 * Handles API errors consistently across the application
 * 
 * @param error The error object
 * @param options Configuration options for error handling
 * @returns The error object (for chaining)
 */
export function handleApiError(error: any, options: ApiErrorOptions = {}): Error {
  // Default message if none provided
  const message = options.customMessage || "Unable to connect to the server. Please try again later.";
  
  // Log the error to console with details if available
  console.error("API Error:", error, options.details || "");
  
  // Show toast notification if not disabled
  if (options.showToast !== false) {
    toast({
      title: "Connection Error",
      description: message,
      variant: "destructive",
    });
  }
  
  // Return the error for chaining
  return error instanceof Error ? error : new Error(message);
}

/**
 * Helper to determine if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  return error instanceof Error && 
    (error.message.includes("Failed to fetch") || 
     error.message.includes("Network request failed") ||
     error.name === "TypeError");
}
