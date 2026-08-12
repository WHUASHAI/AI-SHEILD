'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden text-foreground"
      style={{ background: 'linear-gradient(160deg, #07111e 0%, #09182e 50%, #07111e 100%)' }}>
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={toggleSidebar}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader 
          onMenuClick={toggleMobileSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}