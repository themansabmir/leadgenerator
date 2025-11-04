/**
 * Dashboard Header Component
 * Header with user menu and logout functionality
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Header Props
 */
interface HeaderProps {
  onMenuToggle: () => void;
}

/**
 * User Menu Component
 * Dropdown menu for user actions
 */
const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (email: string): string => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-3 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getUserInitials(user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium truncate max-w-32">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div>
            <p className="text-sm font-medium truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          Profile (Coming Soon)
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          Settings (Coming Soon)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Dashboard Header Component
 */
export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Page title - hidden on mobile */}
          <h1 className="hidden lg:block ml-4 text-lg font-semibold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
