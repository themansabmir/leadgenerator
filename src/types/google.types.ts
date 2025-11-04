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
