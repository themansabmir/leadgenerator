/**
 * POST /api/queries/[id]/pause
 * Pause a running or pending query
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { pauseQuery } from '@/lib/services/query/QueryService';
import { queryIdParamSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError } from '@/lib/utils/logger';

export async function POST(
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

    // Pause query
    await pauseQuery(parsed.data.id);

    return NextResponse.json({
      success: true,
      message: 'Query paused successfully'
    });
  } catch (error: any) {
    logError('POST /api/queries/[id]/pause error', error);
    
    const message = error.message || 'Internal server error';
    const status = message.includes('not found') ? 404 : 
                   message.includes('only pause') ? 400 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
