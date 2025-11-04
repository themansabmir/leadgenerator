/**
 * Signup API Route
 * User registration endpoint following clean architecture principles
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/db/mongodb';
import { User } from '@/db/models/User';
import { createToken, setAuthCookie } from '@/lib/auth/tokenManager';
import { validateSignupCredentials, sanitizeEmail } from '@/lib/auth/validation';
import { SignupCredentials, AuthResponse } from '@/types/auth';

/**
 * POST /api/auth/signup
 * Registers a new user and returns JWT token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: SignupCredentials = await request.json();
    
    // Validate input
    const validation = validateSignupCredentials(body);
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        } as AuthResponse,
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Create user object without password
    const userResponse = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      createdAt: savedUser.createdAt
    };

    // Generate JWT token
    const token = createToken(userResponse);

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userResponse,
        message: 'Account created successfully'
      } as AuthResponse,
      { status: 201 }
    );

    // Set authentication cookie
    return setAuthCookie(response, token);

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        } as AuthResponse,
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as AuthResponse,
      { status: 500 }
    );
  }
}
