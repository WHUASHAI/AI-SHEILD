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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  return (
    <>
      <header className="h-16 shrink-0 bg-[#111827] border-b border-[#1f2937] px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md hover:bg-[#1f2937] text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search scans, reports, or settings..." 
              className="w-full bg-[#0a0f1e] border border-[#1f2937] text-sm text-gray-200 rounded-md pl-9 pr-12 py-2 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center border border-[#1f2937] bg-[#111827] rounded px-1.5 font-mono text-[10px] text-gray-500 font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center mr-2 px-3 py-1.5 rounded-full bg-[#1f2937] border border-[#374151]">
            <span className="text-xs font-medium text-gray-300">
              <span className="text-[#06b6d4]">45</span> of 100 scans used this month
            </span>
          </div>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-md hover:bg-[#1f2937] text-gray-400 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setNotificationsOpen(true)}
            className="p-2 rounded-md hover:bg-[#1f2937] text-gray-400 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#111827]"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#1f2937] transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-white font-semibold text-sm">
                JD
              </div>
            </button>

            {userDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#111827] border border-[#1f2937] shadow-lg shadow-black/50 py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#1f2937]">
                    <p className="text-sm font-medium text-white">Elijah</p>
                    <p className="text-xs text-gray-500 truncate">john@example.com</p>
                  </div>
                  
                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2937] hover:text-white"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1f2937] hover:text-white"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-[#1f2937] mt-1 pt-1">
                    <button 
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#1f2937] hover:text-red-300"
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
