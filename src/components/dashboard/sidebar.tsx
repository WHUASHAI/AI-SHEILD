'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  UserX,
  Sparkles,
  Files,
  Clock,
  FolderOpen,
  Key,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'New Scan', icon: Plus, href: '/dashboard/new-scan' },
      ],
    },
    {
      title: 'Detectors',
      items: [
        { label: 'Text', icon: FileText, href: '/dashboard/text' },
        { label: 'Image', icon: ImageIcon, href: '/dashboard/image' },
        { label: 'Video', icon: Video, href: '/dashboard/video' },
        { label: 'Deepfake', icon: UserX, href: '/dashboard/deepfake' },
        { label: 'Enhancement', icon: Sparkles, href: '/dashboard/enhancement' },
        { label: 'Batch', icon: Files, href: '/dashboard/batch' },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'History', icon: Clock, href: '/dashboard/history' },
        { label: 'Reports', icon: FolderOpen, href: '/dashboard/reports' },
        { label: 'API Keys', icon: Key, href: '/dashboard/api-keys' },
        { label: 'Team', icon: Users, href: '/dashboard/team' },
        { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: HelpCircle, href: '/dashboard/help' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111827] border-r border-[#1f2937] text-gray-300">
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2937]">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <ShieldAlert className="w-8 h-8 text-[#06b6d4] shrink-0" />
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-lg text-white whitespace-nowrap"
            >
              AI Shield
            </motion.span>
          )}
        </Link>
        
        {/* Mobile close button */}
        <button 
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-md hover:bg-[#1f2937] text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-[#1f2937]">
        <nav className="space-y-6 px-2">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group relative",
                          isActive 
                            ? "bg-[#1f2937] text-white" 
                            : "hover:bg-[#1f2937]/50 hover:text-white"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 shrink-0 transition-colors",
                          isActive ? "text-[#06b6d4]" : "text-gray-400 group-hover:text-gray-300"
                        )} />
                        
                        {!collapsed && (
                          <span className="whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Profile / Collapse */}
      <div className="border-t border-[#1f2937] p-2">
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-2 mb-2 rounded-md hover:bg-[#1f2937] text-gray-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        
        <div className={cn(
          "flex items-center rounded-md p-2 hover:bg-[#1f2937] cursor-pointer transition-colors",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] shrink-0 flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">Elijah</p>
              <p className="text-xs text-gray-500 truncate">Free Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        className="hidden md:block shrink-0 z-10 transition-all duration-300 ease-in-out h-full"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
