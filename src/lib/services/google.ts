import axios from 'axios';
import { GoogleSearchResult, GoogleSearchParams, GoogleFormattedResult } from '../../types/google.types';
import { GOOGLE_API_BASE, GOOGLE_API_KEY, GOOGLE_CX_ID } from '../../config';
import { delay } from '../utils';

export class GoogleSearchService {
    private apiKey: string;
    private cx: string;
    private baseUrl: string;
    private readonly MAX_RESULTS = 50;
    private readonly PAGE_SIZE = 10;

    constructor(apiKey = GOOGLE_API_KEY, cx = GOOGLE_CX_ID) {
        this.apiKey = apiKey;
        this.cx = cx;
        this.baseUrl = GOOGLE_API_BASE;
    }

    /**
     * Performs paginated search and streams results to callback per page.
     *
     * @param params - Search parameters (queryName, userQuery, category)
     * @param onPageResults - Optional callback to handle each page's formatted results
     * @returns all formatted results combined (also returned for convenience)
     */
    async search(
        params: GoogleSearchParams,
        onPageResults?: (results: GoogleFormattedResult[]) => Promise<void> | void
    ): Promise<GoogleFormattedResult[]> {
        const { queryName, userQuery, category } = params;
        const allResults: GoogleFormattedResult[] = [];

        let startIndex = 1;
        let totalResults = 0;
        let fetchedResults = 0;

        try {
            while (true) {
                const results = await this.fetchPage(userQuery, startIndex);
                const formatted = this.formatResults(queryName, category, results.items || []);

                // Store incrementally
                allResults.push(...formatted);
                if (onPageResults && formatted.length > 0) {
                    await onPageResults(formatted);
                }

                // Update counters
                fetchedResults += formatted.length;
                totalResults = parseInt(results.queries?.request?.[0]?.totalResults || '0', 10);

                // Stop conditions
                const nextStart = results.queries?.nextPage?.[0]?.startIndex;
                if (!nextStart || fetchedResults >= this.MAX_RESULTS || fetchedResults >= totalResults) break;

                startIndex = nextStart;
                await delay(1000)
            }
        } catch (err) {
            console.error('Error during search:', (err as Error).message);
        }

        return allResults;
    }

    private async fetchPage(query: string, start: number): Promise<GoogleSearchResult> {
        const url = `${this.baseUrl}?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}&start=${start}`;
        const { data } = await axios.get(url);
        return data;
    }

    private formatResults(queryName: string, category: string, items: any[]): GoogleFormattedResult[] {
        return items.map((item) => ({
            queryName,
            category,
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            displayLink: item.displayLink,
            formattedUrl: item.formattedUrl,
            timestamp: new Date().toISOString(),
        }));
    }
}
