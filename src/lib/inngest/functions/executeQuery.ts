/**
 * Inngest Function: Execute Query
 * Executes all pages of a query combo with automatic retries and rate limiting
 */

import { inngest } from '../client';
import { executeQueryPage } from '@/lib/services/query/QueryExecutionService';
import { getQueryStatus } from '@/lib/services/query/QueryService';
import { logInfo, logError } from '@/lib/utils/logger';
import { connectDB } from '@/db/mongodb';

export const executeQuery = inngest.createFunction(
  {
    id: 'execute-query',
    name: 'Execute Query Combo',
    retries: 3,
  },
  { event: 'query/execute.requested' },
  async ({ event, step }) => {
    const { queryId } = event.data;

    logInfo('Inngest: Starting query execution', { queryId });

    // Ensure DB connection
    await step.run('connect-db', async () => {
      await connectDB();
      return { connected: true };
    });

    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
      // Execute single page with automatic retry
      const result = await step.run(`execute-page-${pageNumber}`, async () => {
        try {
          const pageResult = await executeQueryPage(queryId);
          
          logInfo('Inngest: Page executed', {
            queryId,
            pageNumber,
            insertedCount: pageResult.insertedCount,
            hasMore: pageResult.hasMore,
            success: pageResult.success
          });

          return pageResult;
        } catch (error) {
          logError('Inngest: Page execution failed', error, { queryId, pageNumber });
          throw error;
        }
      });

      // Check if we should continue
      if (!result.success) {
        logError('Inngest: Query execution failed', new Error(result.error || 'Unknown error'), {
          queryId,
          pageNumber,
          errorCode: result.errorCode
        });
        
        // Don't continue if there's an error
        return {
          success: false,
          queryId,
          pagesExecuted: pageNumber,
          error: result.error,
          errorCode: result.errorCode
        };
      }

      hasMore = result.hasMore;

      // If there are more pages, add a small delay to respect rate limits
      if (hasMore) {
        await step.sleep('rate-limit-delay', '1s');
        pageNumber++;
      }
    }

    // Get final status
    const finalStatus = await step.run('get-final-status', async () => {
      return await getQueryStatus(queryId);
    });

    logInfo('Inngest: Query execution completed', {
      queryId,
      pagesExecuted: pageNumber,
      totalFetched: finalStatus.totalFetched,
      status: finalStatus.status
    });

    return {
      success: true,
      queryId,
      pagesExecuted: pageNumber,
      totalFetched: finalStatus.totalFetched,
      status: finalStatus.status
    };
  }
);
