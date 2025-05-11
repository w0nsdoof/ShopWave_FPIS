/**
 * Safe wrapper functions for client-side storage operations
 */

export const clientStorage = {
  /**
   * Safely get an item from localStorage
   */
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Error getting ${key} from localStorage:`, e);
      return null;
    }
  },

  /**
   * Safely set an item in localStorage
   */
  set: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
      return false;
    }
  },

  /**
   * Safely remove an item from localStorage
   */
  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
      return false;
    }
  },

  /**
   * Get an object from localStorage with parsing
   */
  getObject: <T>(key: string): T | null => {
    const value = clientStorage.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage:`, e);
      return null;
    }
  },

  /**
   * Set an object in localStorage with stringification
   */
  setObject: <T>(key: string, value: T): boolean => {
    try {
      const stringValue = JSON.stringify(value);
      return clientStorage.set(key, stringValue);
    } catch (e) {
      console.error(`Error stringifying ${key} for localStorage:`, e);
      return false;
    }
  }
};
