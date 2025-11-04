/**
 * Edge Runtime Token Manager
 * JWT token utilities compatible with Next.js Edge Runtime
 */

import { SignJWT, jwtVerify } from 'jose';
import { TokenPayload } from '@/types/auth';
import { authConfig } from './config';

/**
 * Get JWT secret as Uint8Array for jose library
 */
const getJWTSecret = () => {
  return new TextEncoder().encode(authConfig.jwtSecret);
};

/**
 * Verifies a JWT token using jose (Edge Runtime compatible)
 * Pure function that returns either the payload or null
 */
export const verifyTokenEdge = async (token: string): Promise<TokenPayload | null> => {
  try {
    console.log('🔑 [Edge] Verifying token...');
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);
    
    const tokenPayload = payload as unknown as TokenPayload;
    console.log('✅ [Edge] Token verified successfully:', { 
      userId: tokenPayload.userId, 
      email: tokenPayload.email 
    });
    
    return tokenPayload;
  } catch (error) {
    console.error('❌ [Edge] Token verification failed:', error);
    return null;
  }
};

/**
 * Validates token expiration (Edge Runtime compatible)
 * Pure function to check if token is still valid
 */
export const isTokenExpiredEdge = (payload: TokenPayload): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Token validation pipeline for Edge Runtime
 * Functional composition for token validation
 */
export const validateTokenPipelineEdge = async (token: string | null): Promise<TokenPayload | null> => {
  console.log('🔍 [Edge] Validating token pipeline, hasToken:', !!token);
  if (!token) {
    console.log('❌ [Edge] No token provided');
    return null;
  }

  const payload = await verifyTokenEdge(token);
  if (!payload) {
    console.log('❌ [Edge] Token verification failed');
    return null;
  }

  if (isTokenExpiredEdge(payload)) {
    console.log('❌ [Edge] Token is expired');
    return null;
  }

  console.log('✅ [Edge] Token validation successful');
  return payload;
};
