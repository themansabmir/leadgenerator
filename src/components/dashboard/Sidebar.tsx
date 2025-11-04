/**
 * Dashboard Sidebar Component
 * Navigation sidebar with functional approach
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  Target, 
  Mail, 
  Send, 
  Key,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Navigation item interface
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

/**
 * Navigation items configuration
 * Immutable configuration for sidebar navigation
 */
const navigationItems: readonly NavItem[] = Object.freeze([
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Queries',
    href: '/queries',
    icon: Search,
    description: 'Google dork scraping'
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Contact database'
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Target,
    description: 'Lead management'
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: Mail,
    description: 'Email templates'
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Send,
    description: 'Email campaigns'
  },
  {
    name: 'Credentials',
    href: '/credentials',
    icon: Key,
    description: 'Google API keys'
  }
]);

/**
 * Sidebar Props
 */
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Navigation Item Component
 * Pure functional component for nav items
 */
const NavItem: React.FC<{ 
  item: NavItem; 
  isActive: boolean; 
  onClick?: () => void;
}> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon 
        className={cn(
          'mr-3 h-5 w-5 shrink-0',
          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
        )}
        aria-hidden="true"
      />
      <span className="truncate">{item.name}</span>
    </Link>
  );
};

/**
 * Sidebar Component
 * Responsive navigation sidebar
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  /**
   * Determines if a nav item is active
   * Pure function for active state calculation
   */
  const isActiveItem = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Lead Harvester</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActiveItem(item.href)}
                onClick={() => {
                  // Close mobile sidebar when nav item is clicked
                  if (isOpen) {
                    onToggle();
                  }
                }}
              />
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-muted-foreground text-center">
            <p>Lead Harvester v1.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
};
