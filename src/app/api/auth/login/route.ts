/**
 * Login API Route
 * Secure authentication endpoint following clean architecture principles
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/db/mongodb';
import { User } from '@/db/models/User';
import { createToken, setAuthCookie } from '@/lib/auth/tokenManager';
import { validateLoginCredentials, sanitizeEmail } from '@/lib/auth/validation';
import { LoginCredentials, AuthResponse } from '@/types/auth';
import {
  logRequestStart,
  logRequestComplete,
  logError,
  logAuthFailure,
  logValidationError,
  logInfo,
  createRequestContext,
} from '@/lib/utils/logger';

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestContext = createRequestContext('POST', '/api/auth/login');
  
  try {
    logRequestStart('POST', '/api/auth/login', requestContext);
    
    // Parse request body
    const body: LoginCredentials = await request.json();
    
    // Validate input
    const validation = validateLoginCredentials(body);
    if (!validation.isValid) {
      const errors = Object.values(validation.errors).join(', ');
      logValidationError('/api/auth/login', errors, {
        ...requestContext,
        email: body.email,
      });
      return NextResponse.json(
        {
          success: false,
          error: errors
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
      logAuthFailure('User not found', { ...requestContext, email });
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
      logAuthFailure('Invalid password', {
        ...requestContext,
        email,
        userId: user._id.toString(),
      });
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
    logInfo('User authenticated successfully', {
      ...requestContext,
      userId: userResponse.id,
      email: userResponse.email,
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userResponse,
        message: 'Login successful'
      } as AuthResponse,
      { status: 200 }
    );

    const duration = Date.now() - startTime;
    logRequestComplete('POST', '/api/auth/login', 200, duration, {
      ...requestContext,
      userId: userResponse.id,
    });
    
    // Set authentication cookie
    return setAuthCookie(response, token);

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Login failed with unexpected error', error, {
      ...requestContext,
      duration,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as AuthResponse,
      { status: 500 }
    );
  }
}
