/**
 * GET /api/queries/[id]/export
 * Export query results as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { QueryLink } from '@/db/models';
import { queryIdParamSchema } from '@/lib/validators/query.validators';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { logError } from '@/lib/utils/logger';
import { Types } from 'mongoose';

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

    // Fetch all results for this query
    const results = await QueryLink.find({ 
      queryComboId: new Types.ObjectId(parsed.data.id) 
    })
      .sort({ fetchedAt: -1 })
      .lean();

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No results found for this query' },
        { status: 404 }
      );
    }

    // Generate CSV content
    const csvHeader = 'URL,Title,Snippet,Display Link,Formatted URL,Rank,Page Number,Fetched At\n';
    
    const csvRows = results.map((result: any) => {
      const escapeCsv = (value: any) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCsv(result.url),
        escapeCsv(result.title),
        escapeCsv(result.snippet),
        escapeCsv(result.displayLink),
        escapeCsv(result.formattedUrl),
        escapeCsv(result.rank),
        escapeCsv(result.pageNumber),
        escapeCsv(new Date(result.fetchedAt).toISOString())
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `query-results-${parsed.data.id}-${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    logError('GET /api/queries/[id]/export error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
