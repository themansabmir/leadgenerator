/**
 * Authentication Layout
 * Clean layout for authentication pages
 */

import React from 'react';

/**
 * Auth Layout Props
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Authentication Layout Component
 * Minimal layout for login, register, and other auth pages
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Lead Harvester</h1>
          <p className="mt-2 text-sm text-gray-600">
            Automated lead generation and email campaigns
          </p>
        </div>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 Lead Harvester. All rights reserved.
        </p>
      </div>
    </div>
  );
}
