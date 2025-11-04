/**
 * Dashboard Layout
 * Protected layout with sidebar and header
 */

'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';

/**
 * Dashboard Layout Props
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout Component
 * Protected layout that requires authentication
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ReactQueryProvider>
      <ProtectedRoute>
        <div className="h-screen flex overflow-hidden bg-gray-100">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          {/* Main content area */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            {/* Header */}
            <Header onMenuToggle={toggleSidebar} />
            
            {/* Page content */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </ReactQueryProvider>
  );
}
