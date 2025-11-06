import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';
import { buildPaginatedResponse, getPaginationParams, getSearchParam, getSortParams } from '@/lib/api/queryParams';
import {
  logRequestStart,
  logRequestComplete,
  logError,
  logDatabaseOperation,
  createRequestContext,
} from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestContext = createRequestContext('GET', '/api/dorks');
  
  try {
    logRequestStart('GET', '/api/dorks', requestContext);
    await connectDB();
    logDatabaseOperation('connect', 'dorks', requestContext);

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const sort = getSortParams(searchParams, {
      defaultField: 'createdAt',
      defaultOrder: 'desc',
      allowedFields: ['createdAt', 'query'],
    });
    const search = getSearchParam(searchParams);

    const criteria = search
      ? { query: { $regex: search, $options: 'i' } }
      : {};

    logDatabaseOperation('find', 'dorks', {
      ...requestContext,
      criteria,
      pagination,
      sort,
    });
    
    const [data, total] = await Promise.all([
      Dork.find(criteria)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Dork.countDocuments(criteria),
    ]);

    const duration = Date.now() - startTime;
    logRequestComplete('GET', '/api/dorks', 200, duration, {
      ...requestContext,
      resultCount: data.length,
      total,
    });
    
    return buildPaginatedResponse(data, {
      total,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('GET /api/dorks failed', error, { ...requestContext, duration });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestContext = createRequestContext('POST', '/api/dorks');
  
  try {
    logRequestStart('POST', '/api/dorks', requestContext);
    await connectDB();
    
    const body = await request.json();
    logDatabaseOperation('create', 'dorks', {
      ...requestContext,
      query: body.query,
    });
    
    const newDork = await Dork.create(body);
    
    const duration = Date.now() - startTime;
    logRequestComplete('POST', '/api/dorks', 201, duration, {
      ...requestContext,
      dorkId: newDork._id.toString(),
    });
    
    return NextResponse.json({ success: true, data: newDork }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('POST /api/dorks failed', error, { ...requestContext, duration });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
