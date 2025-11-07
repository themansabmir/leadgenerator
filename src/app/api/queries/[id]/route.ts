/**
 * GET /api/queries/[id]
 * Get query combo details by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { getQueryComboById } from '@/lib/services/query/QueryService';
import { queryIdParamSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Validate ID parameter
    const parsed = queryIdParamSchema.safeParse({ id });
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get query combo
    const queryCombo = await getQueryComboById(parsed.data.id);

    if (!queryCombo) {
      return NextResponse.json(
        { success: false, error: 'Query not found' },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = queryCombo.maxAllowedResults > 0
      ? Math.min(100, Math.round((queryCombo.totalResultsFetched / queryCombo.maxAllowedResults) * 100))
      : 0;

    const canFetchMore = queryCombo.totalResultsFetched < queryCombo.maxAllowedResults &&
                         queryCombo.status !== 'completed' &&
                         queryCombo.status !== 'failed';

    return NextResponse.json({
      success: true,
      data: {
        ...queryCombo,
        progress,
        canFetchMore
      }
    });
  } catch (error) {
    logError('GET /api/queries/[id] error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
