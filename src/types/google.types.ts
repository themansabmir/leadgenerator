// services/types.ts

export interface GoogleSearchParams {
  queryName: string;
  userQuery: string;
  category: string;
}

/**
 * Matches structure returned by Google's Custom Search JSON API.
 */
export interface GoogleSearchResult {
  kind?: string;
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
    formattedUrl: string;
  }>;
  queries?: {
    request?: Array<{
      title?: string;
      totalResults?: string;
      searchTerms?: string;
      count?: number;
      startIndex?: number;
      cx?: string;
    }>;
    nextPage?: Array<{
      startIndex: number;
      count?: number;
    }>;
  };
  searchInformation?: {
    searchTime?: number;
    totalResults?: string;
    formattedSearchTime?: string;
    formattedTotalResults?: string;
  };
  context?: {
    title?: string;
  };
}

/**
 * Normalized output we use inside the app.
 */
export interface GoogleFormattedResult {
  queryName: string;
  category: string;
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  timestamp: string;
}

/**
 * Google Search API Response
 */
export interface GoogleSearchAPIResponse {
  kind: string;
  url?: {
    type: string;
    template: string;
  };
  queries?: {
    request?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context?: {
    title: string;
  };
  searchInformation?: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: Array<{
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    cacheId?: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap?: Record<string, any>;
  }>;
}

/**
 * Normalized search result for internal use
 */
export interface NormalizedSearchResult {
  url: string;
  canonicalUrl: string;
  title: string;
  snippet: string;
  displayLink: string | null;
  formattedUrl: string | null;
  rank: number;
  pageNumber: number;
}

/**
 * Google Search Error Types
 */
export type GoogleSearchErrorCode = 
  | 'RATE_LIMIT' 
  | 'QUOTA_EXCEEDED' 
  | 'INVALID_CREDENTIAL' 
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

/**
 * Google Search Error
 */
export interface GoogleSearchError {
  code: GoogleSearchErrorCode;
  message: string;
  retryAfter?: number;
  originalError?: any;
}

/**
 * Decrypted credential data
 */
export interface DecryptedCredential {
  apiKey: string;
  engineId: string;
}
