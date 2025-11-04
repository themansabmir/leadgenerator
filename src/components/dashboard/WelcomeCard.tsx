/**
 * Welcome Card Component
 * Dashboard welcome section with user greeting
 */

'use client';

import React from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { Sparkles, TrendingUp, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Stats data interface
 */
interface StatItem {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/**
 * Mock stats data - will be replaced with real data in future phases
 */
const mockStats: readonly StatItem[] = Object.freeze([
  {
    name: 'Total Queries',
    value: '0',
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    name: 'Contacts Found',
    value: '0',
    icon: Users,
    color: 'text-green-600'
  },
  {
    name: 'Emails Sent',
    value: '0',
    icon: Mail,
    color: 'text-purple-600'
  }
]);

/**
 * Stat Card Component
 */
const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => {
  const Icon = stat.icon;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {stat.name}
              </dt>
              <dd className="text-lg font-medium">
                {stat.value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Welcome Card Component
 */
export const WelcomeCard: React.FC = () => {
  const { user } = useCurrentUser();

  /**
   * Get greeting based on time of day
   */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /**
   * Get user's first name from email
   */
  const getFirstName = (email: string): string => {
    const username = email.split('@')[0];
    const name = username.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="px-6 py-8">
          <div className="flex items-center">
            <div className="shrink-0">
              <Sparkles className="h-8 w-8 text-blue-200" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}, {getFirstName(user.email)}!
              </h1>
              <p className="text-blue-100 mt-1">
                Welcome to your Lead Harvester dashboard. Ready to generate some leads?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Getting Started Section */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to start generating leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="shrink-0">
                <Badge className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center p-0">
                  <span className="text-xs font-medium text-white">1</span>
                </Badge>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  Set up Google API credentials
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add your Google Custom Search API credentials to start scraping
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="shrink-0">
                <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                  <span className="text-xs font-medium">2</span>
                </Badge>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Create your first query
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use Google dorks to find potential customers
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="shrink-0">
                <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                  <span className="text-xs font-medium">3</span>
                </Badge>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Extract contact information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extract emails and phone numbers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
