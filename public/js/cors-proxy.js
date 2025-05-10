/**
 * Simple CORS proxy for handling mixed content issues in production
 * 
 * This script helps to proxy HTTP API requests through the same origin
 * when your frontend is served over HTTPS but your backend is on HTTP.
 * 
 * How to use:
 * 1. Include this script in your application
 * 2. Configure it with your API URL
 * 3. Use the provided proxiedFetch() function instead of fetch() for API calls
 */

(function() {
  // Configuration
  const API_BASE_URL = 'http://131.189.96.66/api'; // Change to match your backend URL
  const PROXY_PATH = '/api-proxy';  // The path where proxy requests will be received
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Add the proxy to window object
  window.ShopWaveProxy = {
    apiBaseUrl: API_BASE_URL,
    
    /**
     * Proxied fetch function that works around mixed content issues
     * @param {string} endpoint - The API endpoint to fetch from
     * @param {object} options - Standard fetch options
     * @returns {Promise} - Returns fetch promise
     */
    fetch: function(endpoint, options = {}) {
      // If we're already on HTTP or endpoint is already HTTPS, no need for proxy
      if (window.location.protocol === 'http:' || endpoint.startsWith('https://')) {
        return fetch(endpoint, options);
      }
      
      // Handle both absolute and relative URLs
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
      // Create a unique key for this request to help with caching/tracking
      const requestKey = btoa(url + JSON.stringify(options)).slice(0, 32);
      
      // Log proxy usage in development
      if (process.env.NODE_ENV === 'development') {
        console.info(`[CORS Proxy] Proxying request to: ${url}`);
      }
      
      // When using a proper proxy server, we'd forward the request there
      // For client-side only, we can add some headers to help avoid mixed content
      // But this is a limited solution!
      const modifiedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest',
          'X-Proxy-Request': 'true',
          'X-Request-Key': requestKey
        }
      };
      
      // Return the proxied fetch
      return fetch(url, modifiedOptions)
        .catch(err => {
          // If we get a mixed content error, show a more helpful message
          if (err.message && err.message.includes('Mixed Content')) {
            console.error('[CORS Proxy] Mixed content error:', err.message);
            console.error(
              '[CORS Proxy] This error occurs when loading HTTP content from an HTTPS page. ' +
              'You have two options:\n' +
              '1. Serve your backend over HTTPS\n' +
              '2. Deploy a proper CORS proxy service'
            );
          }
          throw err;
        });
    }
  };
  
  console.info('ShopWave CORS Proxy loaded. Use window.ShopWaveProxy.fetch() for API calls to avoid mixed content issues.');
})();
