import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';
import { buildPaginatedResponse, getPaginationParams, getSearchParam, getSortParams } from '@/lib/api/queryParams';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const [data, total] = await Promise.all([
      Dork.find(criteria)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Dork.countDocuments(criteria),
    ]);

    return buildPaginatedResponse(data, {
      total,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    console.error('GET /api/dorks error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const newDork = await Dork.create(body);
    return NextResponse.json({ success: true, data: newDork }, { status: 201 });
  } catch (error) {
    console.error('POST /api/dorks error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
