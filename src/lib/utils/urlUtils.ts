/**
 * URL Utilities
 * Pure functions for URL canonicalization, validation, and normalization
 */

/**
 * Common tracking parameters to remove from URLs
 */
export const TRACKING_PARAMS = [
  // Google Analytics
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  // Facebook
  'fbclid',
  'fb_action_ids',
  'fb_action_types',
  'fb_source',
  'fb_ref',
  // Google Ads
  'gclid',
  'gclsrc',
  'dclid',
  'gbraid',
  'wbraid',
  // Other common tracking
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
  'ref',
  'referrer',
  'source',
  'campaign',
  'medium',
  'content',
  'term'
];

/**
 * Check if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL, false otherwise
 * @example
 * isValidUrl('https://example.com') // true
 * isValidUrl('not a url') // false
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extract domain from URL
 * @param url - URL string
 * @returns domain name or empty string if invalid
 * @example
 * extractDomain('https://www.example.com/path') // 'www.example.com'
 * extractDomain('invalid') // ''
 */
export const extractDomain = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
};

/**
 * Remove tracking parameters from URL
 * @param url - URL string
 * @returns URL without tracking parameters
 * @example
 * removeTrackingParams('https://example.com?utm_source=google&page=1')
 * // 'https://example.com?page=1'
 */
export const removeTrackingParams = (url: string): string => {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    
    // Remove tracking parameters
    TRACKING_PARAMS.forEach(param => {
      params.delete(param);
    });
    
    // Rebuild URL
    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
};

/**
 * Canonicalize URL for deduplication
 * - Converts to lowercase
 * - Removes trailing slash
 * - Removes tracking parameters
 * - Normalizes protocol to https
 * - Removes www. prefix
 * - Sorts query parameters alphabetically
 * - Removes fragment/hash
 * 
 * @param url - URL string to canonicalize
 * @returns Canonical URL string
 * @example
 * canonicalizeUrl('HTTP://WWW.Example.com/Path/?utm_source=google&b=2&a=1#section')
 * // 'https://example.com/path?a=1&b=2'
 */
export const canonicalizeUrl = (url: string): string => {
  try {
    // Parse URL
    let parsed = new URL(url.trim());
    
    // Normalize protocol to https
    parsed.protocol = 'https:';
    
    // Normalize hostname: lowercase and remove www.
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    parsed.hostname = hostname;
    
    // Normalize pathname: lowercase and remove trailing slash
    let pathname = parsed.pathname.toLowerCase();
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;
    
    // Remove tracking parameters and sort remaining ones
    const params = new URLSearchParams(parsed.search);
    const cleanParams = new URLSearchParams();
    
    // Filter out tracking params and collect clean ones
    const sortedParams: [string, string][] = [];
    params.forEach((value, key) => {
      if (!TRACKING_PARAMS.includes(key.toLowerCase())) {
        sortedParams.push([key, value]);
      }
    });
    
    // Sort parameters alphabetically
    sortedParams.sort((a, b) => a[0].localeCompare(b[0]));
    sortedParams.forEach(([key, value]) => {
      cleanParams.append(key, value);
    });
    
    parsed.search = cleanParams.toString();
    
    // Remove fragment/hash
    parsed.hash = '';
    
    return parsed.toString();
  } catch {
    // If parsing fails, return original URL
    return url;
  }
};

/**
 * Batch canonicalize multiple URLs
 * @param urls - Array of URL strings
 * @returns Array of canonical URLs
 */
export const canonicalizeUrls = (urls: string[]): string[] => {
  return urls.map(canonicalizeUrl);
};

/**
 * Check if two URLs are equivalent after canonicalization
 * @param url1 - First URL
 * @param url2 - Second URL
 * @returns true if URLs are equivalent
 * @example
 * areUrlsEquivalent('http://www.example.com/', 'https://example.com')
 * // true
 */
export const areUrlsEquivalent = (url1: string, url2: string): boolean => {
  return canonicalizeUrl(url1) === canonicalizeUrl(url2);
};
