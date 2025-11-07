/**
 * GET /api/queries/[id]/results
 * Get query results (links) with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { getQueryResults } from '@/lib/services/query/QueryService';
import { queryIdParamSchema, queryResultsFilterSchema } from '@/lib/validators/query.validators';
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
    const idParsed = queryIdParamSchema.safeParse({ id });
    
    if (!idParsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder')
    };

    const parsed = queryResultsFilterSchema.safeParse(queryParams);
    
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    await connectDB();

    // Get query results
    const { data, total } = await getQueryResults(idParsed.data.id, parsed.data);

    // Calculate pagination metadata
    const { page, limit } = parsed.data;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    logError('GET /api/queries/[id]/results error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
