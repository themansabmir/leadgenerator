import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Query } from '@/models/Query';
import { GoogleSearchService } from '@/lib/services/google';
import { GoogleFormattedResult } from '@/types/google.types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { queryName, userQuery, category } = body;
    
    if (!queryName || !userQuery || !category) {
      return NextResponse.json(
        { error: 'queryName, userQuery, and category are required' },
        { status: 400 }
      );
    }

    const googleSearch = new GoogleSearchService();
    let totalSaved = 0;
    let errors: string[] = [];

    // Bulk store function that gets called for each page
    const storeBulkResults = async (results: GoogleFormattedResult[]) => {
      try {
        const queryDocuments = results.map(result => ({
          queryName: result.queryName,
          category: result.category,
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          displayLink: result.displayLink,
          formattedUrl: result.formattedUrl,
          timestamp: result.timestamp,
        }));

        const insertResult = await Query.insertMany(queryDocuments, { 
          ordered: false 
        });
        
        totalSaved += insertResult.length;
        console.log(`Saved ${insertResult.length} results to database`);
        
      } catch (error: any) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
          const savedCount = error.insertedDocs ? error.insertedDocs.length : 0;
          totalSaved += savedCount;
          console.log(`Saved ${savedCount} results, skipped duplicates`);
        } else {
          console.error('Error saving results:', error);
          errors.push(error.message);
        }
      }
    };

    // Perform search with bulk storage callback
    const allResults = await googleSearch.search(
      { queryName, userQuery, category },
      storeBulkResults
    );

    return NextResponse.json({
      success: true,
      data: {
        queryName,
        userQuery,
        category,
        totalResults: allResults.length,
        totalSaved,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Search completed! Found ${allResults.length} results, saved ${totalSaved} to database.`
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}