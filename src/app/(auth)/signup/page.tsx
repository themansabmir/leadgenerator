/**
 * Signup Page
 * Registration page with signup form
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';
import { PublicRoute } from '@/components/auth/AuthGuard';

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Sign Up | Lead Harvester',
  description: 'Create your Lead Harvester account to start automated lead generation and email campaigns.',
};

/**
 * Signup Page Component
 * Public route that redirects authenticated users to dashboard
 */
export default function SignupPage() {
  return (
    <PublicRoute>
      <div className="space-y-6">
        <SignupForm />
        
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
            >
              Sign in here
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
