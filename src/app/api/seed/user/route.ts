/**
 * Seed User API Route
 * Creates an initial admin user via API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';

/**
 * Default admin user credentials
 */
const ADMIN_USER = {
  email: 'admin@leadharvester.com',
  password: 'admin123456' // Change this in production
};

/**
 * POST /api/seed/user
 * Seeds the database with an initial admin user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: ADMIN_USER.email });
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: ADMIN_USER.email,
          password: ADMIN_USER.password
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, saltRounds);

    // Create admin user
    const adminUser = new User({
      email: ADMIN_USER.email,
      password: hashedPassword
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: ADMIN_USER.email,
        password: ADMIN_USER.password
      }
    });

  } catch (error) {
    console.error('Seed user error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create admin user' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed/user
 * Returns admin user credentials if exists
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: ADMIN_USER.email });
    
    return NextResponse.json({
      exists: !!existingUser,
      credentials: existingUser ? {
        email: ADMIN_USER.email,
        password: ADMIN_USER.password
      } : null
    });

  } catch (error) {
    console.error('Check user error:', error);
    
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
