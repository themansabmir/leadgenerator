import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Location } from '@/db/models';
import { buildPaginatedResponse, getPaginationParams, getSearchParam, getSortParams } from '@/lib/api/queryParams';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const sort = getSortParams(searchParams, {
      defaultField: 'createdAt',
      defaultOrder: 'desc',
      allowedFields: ['createdAt', 'name', 'slug'],
    });
    const search = getSearchParam(searchParams);

    const criteria = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      Location.find(criteria)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Location.countDocuments(criteria),
    ]);

    return buildPaginatedResponse(data, {
      total,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const newLocation = await Location.create(body);
    return NextResponse.json({ success: true, data: newLocation }, { status: 201 });
  } catch (error) {
    console.error('POST /api/locations error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
