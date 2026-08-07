'use client';

import { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { NotificationsPanel } from './notifications-panel';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardHeader({ onMenuClick, isSidebarCollapsed }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen]   = useState(false);
  const [isDark, setIsDark]                       = useState(true);

  return (
    <>
      <header className="h-16 shrink-0 bg-space-cadet-dark border-b border-cyan-azure/20 px-4 flex items-center justify-between sticky top-0 z-30">

        {/* Left: hamburger + search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 text-ucla-blue" />
            <input
              type="text"
              placeholder="Search scans, reports, or settings..."
              className="w-full bg-space-cadet/60 border border-cyan-azure/20 text-sm text-foreground rounded-lg pl-9 pr-12 py-2 focus:outline-none focus:border-cyan-azure/60 focus:ring-1 focus:ring-cyan-azure/30 placeholder:text-ucla-blue transition-all"
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center border border-cyan-azure/20 bg-space-cadet rounded px-1.5 font-mono text-[10px] text-ucla-blue font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Usage pill */}
          <div className="hidden lg:flex items-center px-3 py-1.5 rounded-full bg-space-cadet/60 border border-cyan-azure/20">
            <span className="text-xs font-medium text-air-sup-blue">
              <span className="text-cyan-azure font-bold">45</span> of 100 scans this month
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-md hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="p-2 rounded-md hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-lavender rounded-full border-2 border-space-cadet-dark" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cyan-azure/30 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-azure to-pink-lavender flex items-center justify-center text-white font-semibold text-sm shadow-palette-md">
                JD
              </div>
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl glass-card shadow-palette py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-cyan-azure/15">
                    <p className="text-sm font-medium text-foreground">Elijah</p>
                    <p className="text-xs text-ucla-blue truncate">john@example.com</p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-air-sup-blue hover:bg-cyan-azure/10 hover:text-pink-lavender transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>

                  <div className="border-t border-cyan-azure/15 mt-1 pt-1">
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
