/**
 * GET /api/filter-options
 * Get filter options for locations, categories, and dorks based on existing query combos
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { QueryCombo, Location, Category, Dork } from '@/db/models';
import { filterOptionsQuerySchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError } from '@/lib/utils/logger';
import { Types } from 'mongoose';

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
    
    const queryParams = {
      locationId: searchParams.get('locationId'),
      categoryId: searchParams.get('categoryId'),
      dorkId: searchParams.get('dorkId')
    };

    const parsed = filterOptionsQuerySchema.safeParse(queryParams);
    
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

    const { locationId, categoryId, dorkId } = parsed.data;

    // Build base filter for query combos
    const baseFilter: any = {};
    if (locationId) baseFilter.locationId = new Types.ObjectId(locationId);
    if (categoryId) baseFilter.categoryId = new Types.ObjectId(categoryId);
    if (dorkId) baseFilter.dorkId = new Types.ObjectId(dorkId);

    // Get all unique IDs from query combos based on filters
    const queryCombos = await QueryCombo.find(baseFilter).lean();

    const locationIds = new Set(queryCombos.map(q => q.locationId.toString()));
    const categoryIds = new Set(queryCombos.map(q => q.categoryId.toString()));
    const dorkIds = new Set(queryCombos.map(q => q.dorkId.toString()));

    // Fetch actual documents
    const [locations, categories, dorks] = await Promise.all([
      Location.find({ _id: { $in: Array.from(locationIds).map(id => new Types.ObjectId(id)) } })
        .select('name slug')
        .lean(),
      Category.find({ _id: { $in: Array.from(categoryIds).map(id => new Types.ObjectId(id)) } })
        .select('name slug')
        .lean(),
      Dork.find({ _id: { $in: Array.from(dorkIds).map(id => new Types.ObjectId(id)) } })
        .select('query')
        .lean()
    ]);

    // Count queries for each option
    const locationsWithCount = await Promise.all(
      locations.map(async (location: any) => {
        const filter = { ...baseFilter, locationId: location._id };
        const count = await QueryCombo.countDocuments(filter);
        return {
          id: location._id.toString(),
          name: location.name,
          slug: location.slug,
          count
        };
      })
    );

    const categoriesWithCount = await Promise.all(
      categories.map(async (category: any) => {
        const filter = { ...baseFilter, categoryId: category._id };
        const count = await QueryCombo.countDocuments(filter);
        return {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          count
        };
      })
    );

    const dorksWithCount = await Promise.all(
      dorks.map(async (dork: any) => {
        const filter = { ...baseFilter, dorkId: dork._id };
        const count = await QueryCombo.countDocuments(filter);
        return {
          id: dork._id.toString(),
          query: dork.query,
          count
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        locations: locationsWithCount,
        categories: categoriesWithCount,
        dorks: dorksWithCount
      }
    });
  } catch (error) {
    logError('GET /api/filter-options error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
