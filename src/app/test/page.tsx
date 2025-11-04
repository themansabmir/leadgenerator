/**
 * Test Page
 * Simple page to test if the app is working without authentication
 */

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestPage() {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Auth Debug Page</h1>
        
        <div className="space-y-3">
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User:</strong> {user ? user.email : 'None'}
          </div>
          <div>
            <strong>Error:</strong> {error || 'None'}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <a 
            href="/dashboard" 
            className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            🚀 Go to Dashboard (Direct Link)
          </a>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            🔄 Force Redirect to Dashboard
          </button>
          <a 
            href="/login" 
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
          <a 
            href="/signup" 
            className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Go to Signup
          </a>
        </div>
      </div>
    </div>
  );
}
