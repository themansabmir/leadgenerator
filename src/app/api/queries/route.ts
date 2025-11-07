/**
 * GET /api/queries
 * List query combos with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { listQueryCombos } from '@/lib/services/query/QueryService';
import { queryFilterSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    
    const queryParams: any = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      search: searchParams.get('search'),
      locationId: searchParams.get('locationId'),
      categoryId: searchParams.get('categoryId'),
      dorkId: searchParams.get('dorkId')
    };

    // Handle status parameter (can be single or comma-separated)
    const statusParam = searchParams.get('status');
    if (statusParam) {
      queryParams.status = statusParam.includes(',') 
        ? statusParam.split(',') 
        : statusParam;
    }

    const parsed = queryFilterSchema.safeParse(queryParams);
    
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

    // List query combos
    const { data, total } = await listQueryCombos(parsed.data);

    // Calculate pagination metadata
    const { page, limit } = parsed.data;
    const totalPages = Math.ceil(total / limit);

    // Add progress calculation to each query
    const queriesWithProgress = data.map((query: any) => ({
      ...query,
      progress: query.maxAllowedResults > 0
        ? Math.min(100, Math.round((query.totalResultsFetched / query.maxAllowedResults) * 100))
        : 0
    }));

    return NextResponse.json({
      success: true,
      data: queriesWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    logError('GET /api/queries error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
