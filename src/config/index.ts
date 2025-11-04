// services/config.ts

/**
 * Base configuration for Google Custom Search API.
 * Keep keys in environment variables for safety.
 */

export const GOOGLE_API_BASE =
  process.env.GOOGLE_API_BASE || 'https://www.googleapis.com/customsearch/v1';

export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

export const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID || '';

if (!GOOGLE_API_KEY || !GOOGLE_CX_ID) {
  console.warn(
    '⚠️ Missing Google API credentials: set GOOGLE_API_KEY and GOOGLE_CX_ID in environment variables.'
  );
}
