/**
 * Login API Route
 * Secure authentication endpoint following clean architecture principles
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { createToken, setAuthCookie } from '@/lib/auth/tokenManager';
import { validateLoginCredentials, sanitizeEmail } from '@/lib/auth/validation';
import { LoginCredentials, AuthResponse } from '@/types/auth';

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: LoginCredentials = await request.json();
    
    // Validate input
    const validation = validateLoginCredentials(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: Object.values(validation.errors).join(', ')
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Sanitize email
    const email = sanitizeEmail(body.email);
    const { password } = body;

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Create user object without password
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt
    };

    // Generate JWT token
    const token = createToken(userResponse);

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userResponse,
        message: 'Login successful'
      } as AuthResponse,
      { status: 200 }
    );

    // Set authentication cookie
    return setAuthCookie(response, token);

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as AuthResponse,
      { status: 500 }
    );
  }
}
