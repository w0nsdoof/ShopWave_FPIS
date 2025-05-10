/**
 * Mixed Content Detector for ShopWave
 * 
 * This script helps detect mixed content issues when the site is loaded over HTTPS.
 * It monitors all network requests and logs any HTTP requests that could cause mixed content warnings.
 * 
 * How to use:
 * 1. Add this script to your HTML head or include it as a module
 * 2. Open browser console to see warnings about mixed content requests
 * 3. Use the global function `checkMixedContent()` to analyze the page on demand
 */

// Store detected issues
const mixedContentIssues = [];

// Function to check if a URL uses HTTP instead of HTTPS
function isHttpUrl(url) {
  try {
    return new URL(url).protocol === 'http:';
  } catch (e) {
    return false;
  }
}

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  
  if (window.location.protocol === 'https:' && isHttpUrl(url)) {
    const issue = {
      type: 'fetch',
      url: url,
      timestamp: new Date().toISOString()
    };
    
    mixedContentIssues.push(issue);
    console.warn('⚠️ Mixed Content Warning: Fetch request to HTTP URL from HTTPS page', issue);
  }
  
  return originalFetch.apply(this, arguments);
};

// Monitor XMLHttpRequest
const originalXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (window.location.protocol === 'https:' && isHttpUrl(url)) {
    const issue = {
      type: 'xhr',
      method: method,
      url: url,
      timestamp: new Date().toISOString()
    };
    
    mixedContentIssues.push(issue);
    console.warn('⚠️ Mixed Content Warning: XHR request to HTTP URL from HTTPS page', issue);
  }
  
  return originalXhrOpen.call(this, method, url, ...rest);
};

// Check images, scripts, iframes, etc.
function checkPageForMixedContent() {
  if (window.location.protocol !== 'https:') {
    console.info('Page is not loaded over HTTPS. Mixed content checks skipped.');
    return [];
  }
  
  const elements = {
    'img': 'src',
    'script': 'src',
    'iframe': 'src',
    'link[rel="stylesheet"]': 'href',
    'audio': 'src',
    'video': 'src',
    'source': 'src',
    'object': 'data',
    'embed': 'src'
  };
  
  const newIssues = [];
  
  Object.entries(elements).forEach(([selector, attribute]) => {
    document.querySelectorAll(selector).forEach(element => {
      const url = element.getAttribute(attribute);
      if (url && isHttpUrl(url)) {
        const issue = {
          type: 'element',
          element: element.tagName.toLowerCase(),
          attribute: attribute,
          url: url,
          timestamp: new Date().toISOString()
        };
        
        newIssues.push(issue);
        mixedContentIssues.push(issue);
        console.warn(`⚠️ Mixed Content Warning: ${element.tagName} with ${attribute}="${url}"`, issue);
      }
    });
  });
  
  return newIssues;
}

// Make function available globally
window.checkMixedContent = function() {
  console.info('Checking page for mixed content issues...');
  const newIssues = checkPageForMixedContent();
  
  console.info(`Found ${newIssues.length} new mixed content issues.`);
  console.info(`Total mixed content issues detected: ${mixedContentIssues.length}`);
  
  if (mixedContentIssues.length > 0) {
    console.table(mixedContentIssues);
  } else {
    console.info('No mixed content issues detected! 🎉');
  }
  
  return mixedContentIssues;
};

// Run on page load
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkPageForMixedContent, 1000);
});

console.info('Mixed Content Detector loaded. Use window.checkMixedContent() to analyze the page.');
