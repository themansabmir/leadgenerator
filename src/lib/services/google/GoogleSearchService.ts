/**
 * Google Search Service
 * Pure functions for interacting with Google Custom Search API
 * Following functional programming principles with no side effects
 */

import { 
  GoogleSearchAPIResponse, 
  GoogleSearchError, 
  NormalizedSearchResult,
  DecryptedCredential 
} from '@/types/google.types';
import { canonicalizeUrl } from '@/lib/utils/urlUtils';
import { decrypt } from '@/lib/utils/encryption';
import { logInfo, logError, logWarn } from '@/lib/utils/logger';
import { Credential } from '@/db/models';

/**
 * Google Custom Search API endpoint
 */
const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

/**
 * Default page size for Google Search API
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Get decrypted credential from database
 * @param credentialId - Credential ID
 * @returns Decrypted API key and engine ID
 */
export const getDecryptedCredential = async (
  credentialId: string
): Promise<DecryptedCredential> => {
  try {
    const credential = await Credential.findById(credentialId)
      .select('+apiKey +engineId')
      .lean();

    if (!credential) {
      throw new Error('Credential not found');
    }

    const apiKey = decrypt(credential.apiKey);
    const engineId = decrypt(credential.engineId);

    return { apiKey, engineId };
  } catch (error) {
    logError('Failed to get decrypted credential', error, { credentialId });
    throw error;
  }
};

/**
 * Search Google using Custom Search API
 * @param dorkString - Google dork query string
 * @param credentialId - Credential ID for API access
 * @param startIndex - Start index for pagination (1-based)
 * @returns Google Search API response
 */
export const searchGoogleDork = async (
  dorkString: string,
  credentialId: string,
  startIndex: number = 1
): Promise<GoogleSearchAPIResponse> => {
  try {
    // Get decrypted credentials
    const { apiKey, engineId } = await getDecryptedCredential(credentialId);

    // Build query parameters
    const params = new URLSearchParams({
      key: apiKey,
      cx: engineId,
      q: dorkString,
      start: startIndex.toString(),
      num: DEFAULT_PAGE_SIZE.toString()
    });

    const url = `${GOOGLE_SEARCH_API_URL}?${params.toString()}`;

    logInfo('Executing Google Search', {
      dorkString,
      startIndex,
      credentialId
    });

    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw await handleGoogleAPIError(response.status, errorData);
    }

    const data: GoogleSearchAPIResponse = await response.json();

    logInfo('Google Search completed successfully', {
      dorkString,
      startIndex,
      resultsCount: data.items?.length || 0
    });

    return data;
  } catch (error) {
    logError('Google Search failed', error, { dorkString, startIndex });
    throw error;
  }
};

/**
 * Handle Google API errors and convert to GoogleSearchError
 * @param statusCode - HTTP status code
 * @param errorData - Error response data
 * @returns GoogleSearchError
 */
const handleGoogleAPIError = async (
  statusCode: number,
  errorData: any
): Promise<GoogleSearchError> => {
  const errorMessage = errorData?.error?.message || 'Unknown error';
  
  switch (statusCode) {
    case 429:
      logWarn('Google API rate limit exceeded', { statusCode, errorMessage });
      return {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 3600, // 1 hour
        originalError: errorData
      };
    
    case 403:
      // Check if it's quota exceeded or invalid credentials
      if (errorMessage.toLowerCase().includes('quota')) {
        logWarn('Google API quota exceeded', { statusCode, errorMessage });
        return {
          code: 'QUOTA_EXCEEDED',
          message: 'Daily quota exceeded. Please try again tomorrow.',
          originalError: errorData
        };
      } else {
        logWarn('Invalid Google API credentials', { statusCode, errorMessage });
        return {
          code: 'INVALID_CREDENTIAL',
          message: 'Invalid API credentials. Please check your API key and engine ID.',
          originalError: errorData
        };
      }
    
    case 400:
      logWarn('Invalid Google API request', { statusCode, errorMessage });
      return {
        code: 'INVALID_REQUEST',
        message: `Invalid request: ${errorMessage}`,
        originalError: errorData
      };
    
    default:
      logError('Google API unknown error', errorData, { statusCode });
      return {
        code: 'UNKNOWN_ERROR',
        message: `API error: ${errorMessage}`,
        originalError: errorData
      };
  }
};

/**
 * Normalize Google Search API results for internal use
 * @param apiResponse - Google Search API response
 * @param queryComboId - Query combo ID for reference
 * @returns Array of normalized search results
 */
export const normalizeSearchResults = (
  apiResponse: GoogleSearchAPIResponse,
  queryComboId: string
): NormalizedSearchResult[] => {
  if (!apiResponse.items || apiResponse.items.length === 0) {
    return [];
  }

  const startIndex = apiResponse.queries?.request?.[0]?.startIndex || 1;
  const pageNumber = Math.ceil(startIndex / DEFAULT_PAGE_SIZE);

  return apiResponse.items.map((item, index) => {
    const url = item.link;
    const canonicalUrl = canonicalizeUrl(url);
    const rank = startIndex + index;

    return {
      url,
      canonicalUrl,
      title: item.title || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink || null,
      formattedUrl: item.formattedUrl || null,
      rank,
      pageNumber
    };
  });
};

/**
 * Check if there are more pages available
 * @param apiResponse - Google Search API response
 * @param currentTotal - Current total results fetched
 * @param maxAllowed - Maximum allowed results
 * @returns true if more pages available
 */
export const hasNextPage = (
  apiResponse: GoogleSearchAPIResponse,
  currentTotal: number,
  maxAllowed: number
): boolean => {
  // Check if we've reached the max allowed limit
  if (currentTotal >= maxAllowed) {
    return false;
  }

  // Check if API indicates next page exists
  const hasNextPageInResponse = !!(apiResponse.queries?.nextPage && 
                                 apiResponse.queries.nextPage.length > 0);

  // Check if there are items in current response
  const hasItems = !!(apiResponse.items && apiResponse.items.length > 0);

  return hasNextPageInResponse && hasItems;
};

/**
 * Calculate next start index for pagination
 * @param currentStartIndex - Current start index
 * @param pageSize - Page size (default: 10)
 * @returns Next start index
 */
export const calculateNextStartIndex = (
  currentStartIndex: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): number => {
  return currentStartIndex + pageSize;
};

/**
 * Get start index from API response
 * @param apiResponse - Google Search API response
 * @returns Start index or 1 if not found
 */
export const getStartIndexFromResponse = (
  apiResponse: GoogleSearchAPIResponse
): number => {
  return apiResponse.queries?.request?.[0]?.startIndex || 1;
};

/**
 * Get total results from API response
 * @param apiResponse - Google Search API response
 * @returns Total results count
 */
export const getTotalResultsFromResponse = (
  apiResponse: GoogleSearchAPIResponse
): number => {
  const totalResultsStr = apiResponse.searchInformation?.totalResults || '0';
  return parseInt(totalResultsStr, 10);
};
