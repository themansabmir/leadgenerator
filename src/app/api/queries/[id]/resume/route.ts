/**
 * POST /api/queries/[id]/resume
 * Resume a paused query
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { resumeQuery } from '@/lib/services/query/QueryService';
import { inngest } from '@/lib/inngest/client';
import { queryIdParamSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError, logInfo } from '@/lib/utils/logger';

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

    // Resume query
    await resumeQuery(parsed.data.id);

    // Trigger Inngest background execution
    await inngest.send({
      name: 'query/execute.requested',
      data: {
        queryId: parsed.data.id,
        userId: payload.userId
      }
    });

    logInfo('Query resumed and Inngest event triggered', { queryId: parsed.data.id });

    return NextResponse.json({
      success: true,
      message: 'Query resumed successfully. Execution restarted in background.'
    });
  } catch (error: any) {
    logError('POST /api/queries/[id]/resume error', error);
    
    const message = error.message || 'Internal server error';
    const status = message.includes('not found') ? 404 : 
                   message.includes('only resume') ? 400 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
