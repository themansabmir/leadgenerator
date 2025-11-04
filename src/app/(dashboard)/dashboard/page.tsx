/**
 * Dashboard Page
 * Main dashboard overview page
 */

import React from 'react';
import { Metadata } from 'next';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Dashboard | Lead Harvester',
  description: 'Lead Harvester dashboard - Overview of your lead generation activities, campaigns, and analytics.',
};

/**
 * Dashboard Page Component
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your lead generation activities and campaign performance
          </p>
        </div>
      </div>

      <WelcomeCard />
    </div>
  );
}
