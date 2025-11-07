/**
 * Token management utilities
 * Functional approach with pure functions and immutable operations
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User, TokenPayload } from '@/types/auth';
import { authConfig, cookieConfig } from './config';

/**
 * Creates a JWT token for a user
 * Pure function that generates a token without side effects
 */
export const createToken = (user: User): string => {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email
    };

    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn as any
    });
};

/**
 * Verifies and decodes a JWT token
 * Pure function that returns either the payload or null
 */
export const verifyToken = (token: string): TokenPayload | null => {
    try {
        console.log(' Verifying token with secret:', authConfig.jwtSecret.substring(0, 10) + '...');
        const decoded = jwt.verify(token, authConfig.jwtSecret) as TokenPayload;
        console.log(' Token verified successfully:', { userId: decoded.userId, email: decoded.email });
        return decoded;
    } catch (error) {
        console.error(' Token verification failed:', error);
        return null;
    }
};

/**
 * Extracts token from request headers or cookies
 * Pure function that handles multiple token sources
 */
export const extractTokenFromRequest = (request: NextRequest): string | null => {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Try cookie
    const cookieToken = request.cookies.get(authConfig.cookieName)?.value;
    return cookieToken || null;
};

/**
 * Extracts token from server-side cookies
 * Server-side token extraction for API routes
 */
export const extractTokenFromCookies = async (): Promise<string | null> => {
    try {
        const cookieStore = await cookies();
        return cookieStore.get(authConfig.cookieName)?.value || null;
    } catch (error) {
        return null;
    }
};

/**
 * Sets authentication cookie in response
 * Functional approach to cookie setting
 */
export const setAuthCookie = (response: NextResponse, token: string): NextResponse => {
    response.cookies.set(authConfig.cookieName, token, cookieConfig);
    return response;
};

/**
 * Clears authentication cookie
 * Functional approach to cookie clearing
 */
export const clearAuthCookie = (response: NextResponse): NextResponse => {
    response.cookies.set(authConfig.cookieName, '', {
        ...cookieConfig,
        maxAge: 0
    });
    return response;
};

/**
 * Validates token expiration
 * Pure function to check if token is still valid
 */
export const isTokenExpired = (payload: TokenPayload): boolean => {
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
};

/**
 * Creates a new token with extended expiration
 * Pure function for token refresh
 */
export const refreshToken = (currentPayload: TokenPayload): string => {
    const newPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: currentPayload.userId,
        email: currentPayload.email
    };

    return jwt.sign(newPayload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn as any
    });
};

/**
 * Token validation pipeline
 * Functional composition for token validation
 */
export const validateTokenPipeline = (token: string | null): TokenPayload | null => {
    console.log('🔍 Validating token pipeline, hasToken:', !!token);
    if (!token) {
        console.log('❌ No token provided');
        return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
        console.log('❌ Token verification failed');
        return null;
    }

    if (isTokenExpired(payload)) {
        console.log('❌ Token is expired');
        return null;
    }

    console.log('✅ Token validation successful');
    return payload;
};

/**
 * Higher-order function for token-based operations
 * Functional approach to handle authenticated operations
 */
export const withTokenValidation = <T extends any[], R>(
    operation: (payload: TokenPayload, ...args: T) => R
) => {
    return (token: string | null, ...args: T): R | null => {
        const payload = validateTokenPipeline(token);
        return payload ? operation(payload, ...args) : null;
    };
};
