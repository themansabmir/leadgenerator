/**
 * Logout API Route
 * Clears authentication cookie and ends user session
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/tokenManager';
import { ApiResponse } from '@/types/auth';

/**
 * POST /api/auth/logout
 * Clears authentication cookie and logs out user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful'
      } as ApiResponse,
      { status: 200 }
    );

    // Clear authentication cookie
    return clearAuthCookie(response);

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as ApiResponse,
      { status: 500 }
    );
  }
}
