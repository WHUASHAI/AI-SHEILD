'use client';

import { useState } from 'react';
import theme from '@/components/shared/app-theme.module.css';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className={`${theme.appTheme} ${theme.dashboardShell} flex h-screen overflow-hidden text-foreground`} data-app-theme="elucid-v2">
      <DashboardSidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} onToggleCollapse={toggleSidebar} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setMobileSidebarOpen(value => !value)} isSidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-10" />
          <div className="relative z-10 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
