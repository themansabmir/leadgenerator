/**
 * POST /api/queries/run
 * Create and run a new query combo
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { createOrGetQueryCombo } from '@/lib/services/query/QueryService';
import { inngest } from '@/lib/inngest/client';
import { createQuerySchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logInfo, logError } from '@/lib/utils/logger';
import { Location, Category, Dork, Credential } from '@/db/models';

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const json = await request.json();
    const parsed = createQuerySchema.safeParse(json);
    
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const { locationId, categoryId, dorkId, credentialId, maxAllowedResults } = parsed.data;

    await connectDB();

    // Verify all referenced documents exist
    const [location, category, dork, credential] = await Promise.all([
      Location.findById(locationId),
      Category.findById(categoryId),
      Dork.findById(dorkId),
      Credential.findById(credentialId)
    ]);

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (!dork) {
      return NextResponse.json(
        { success: false, error: 'Dork not found' },
        { status: 404 }
      );
    }

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Create or get query combo
    const queryCombo = await createOrGetQueryCombo({
      locationId,
      categoryId,
      dorkId,
      credentialId,
      maxAllowedResults
    });

    const queryId = queryCombo._id.toString();

    logInfo('Query combo created/retrieved', {
      queryId,
      userId: payload.userId
    });

    // Trigger Inngest background execution
    await inngest.send({
      name: 'query/execute.requested',
      data: {
        queryId,
        userId: payload.userId
      }
    });

    logInfo('Inngest event triggered for query execution', { queryId });

    return NextResponse.json(
      {
        success: true,
        data: {
          queryId,
          status: queryCombo.status,
          message: 'Query created successfully. Execution started in background.'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logError('POST /api/queries/run error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
