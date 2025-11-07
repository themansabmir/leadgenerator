/**
 * Login Page
 * Authentication page with login form
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicRoute } from '@/components/auth/AuthGuard';

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Sign In | Lead Harvester',
  description: 'Sign in to your Lead Harvester account to access automated lead generation and email campaigns.',
};

/**
 * Login Page Component
 * Public route that redirects authenticated users to dashboard
 */
export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="space-y-6">
        <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
          <LoginForm />
        </Suspense>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
            >
              Sign up here
            </Link>
          </p>
          
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <a 
              href="mailto:support@leadharvester.com" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}
