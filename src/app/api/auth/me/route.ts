/**
 * Current User API Route
 * Protected endpoint to get current user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { User } from '@/db/models/User';
import { extractTokenFromCookies, validateTokenPipeline } from '@/lib/auth/tokenManager';
import { ApiResponse } from '@/types/auth';

/**
 * GET /api/auth/me
 * Returns current authenticated user information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from cookies
    const token = await extractTokenFromCookies();
    
    // Validate token
    const payload = validateTokenPipeline(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by ID from token
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Return user data without password
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt
    };

    return NextResponse.json(
      {
        success: true,
        user: userResponse
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as ApiResponse,
      { status: 500 }
    );
  }
}
