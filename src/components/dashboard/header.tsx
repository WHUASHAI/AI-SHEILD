'use client';

import { useState } from 'react';
import { Menu, Search, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardHeader({ onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused]         = useState(false);

  return (
    <>
      <header
        className="h-16 shrink-0 px-4 flex items-center justify-between sticky top-0 z-30"
        style={{
          background: 'rgba(7,17,30,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(78,122,177,0.15)',
          boxShadow: '0 1px 0 rgba(78,122,177,0.1)',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex items-center relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 text-ucla-blue/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search scans, reports..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full text-sm text-foreground rounded-xl pl-9 pr-14 py-2 focus:outline-none placeholder:text-ucla-blue/50 transition-all"
              style={{
                background: searchFocused ? 'rgba(78,122,177,0.1)' : 'rgba(255,255,255,0.04)',
                border: searchFocused ? '1px solid rgba(78,122,177,0.45)' : '1px solid rgba(78,122,177,0.15)',
                boxShadow: searchFocused ? '0 0 0 3px rgba(78,122,177,0.12)' : 'none',
              }}
            />
            <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 border border-cyan-azure/15 bg-space-cadet rounded px-1.5 font-mono text-[10px] text-ucla-blue/60">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-air-sup-blue hover:text-white hover:bg-cyan-azure/10 transition-all"
            title="Back to Home"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>
    </>
  );
}
