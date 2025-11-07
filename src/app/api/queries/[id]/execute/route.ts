/**
 * POST /api/queries/[id]/execute
 * Execute a single page of query results
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { executeQueryPage, canExecuteQuery } from '@/lib/services/query/QueryExecutionService';
import { acquireLock, releaseLock } from '@/lib/services/query/QueryLockService';
import { getQueryStatus } from '@/lib/services/query/QueryService';
import { queryIdParamSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError, logWarn } from '@/lib/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let lockAcquired = false;
  let queryId: string = '';

  try {
    // Authenticate
    const token = await extractTokenFromCookies();
    const payload = validateTokenPipeline(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params;
    queryId = id;

    // Validate ID parameter
    const parsed = queryIdParamSchema.safeParse({ id });
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Acquire execution lock
    lockAcquired = acquireLock(queryId);
    
    if (!lockAcquired) {
      logWarn('Query execution already in progress', { queryId });
      return NextResponse.json(
        { success: false, error: 'Query execution already in progress' },
        { status: 409 }
      );
    }

    // Check if query can be executed
    const canExecute = await canExecuteQuery(queryId);
    
    if (!canExecute.canExecute) {
      return NextResponse.json(
        { success: false, error: canExecute.reason },
        { status: 400 }
      );
    }

    // Execute query page
    const result = await executeQueryPage(queryId);

    // Get updated status
    const status = await getQueryStatus(queryId);

    return NextResponse.json({
      success: result.success,
      data: {
        insertedCount: result.insertedCount,
        totalFetched: status.totalFetched,
        hasMore: result.hasMore,
        status: status.status,
        progress: status.progress,
        error: result.error,
        errorCode: result.errorCode
      }
    });
  } catch (error) {
    logError('POST /api/queries/[id]/execute error', error, { id: queryId });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Always release lock
    if (lockAcquired && queryId) {
      releaseLock(queryId);
    }
  }
}
