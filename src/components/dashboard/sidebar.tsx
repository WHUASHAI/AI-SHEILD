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
  X,
  BookCopy,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
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
        { label: 'New Scan',  icon: Plus,            href: '/dashboard/new-scan' },
      ],
    },
    {
      title: 'Detectors',
      items: [
        { label: 'Text',        icon: FileText,  href: '/dashboard/text' },
        { label: 'Image',       icon: ImageIcon, href: '/dashboard/image' },
        { label: 'Video',       icon: Video,     href: '/dashboard/video' },
        { label: 'Deepfake',    icon: UserX,     href: '/dashboard/deepfake' },
        { label: 'Enhancement', icon: Sparkles,  href: '/dashboard/enhancement' },
        { label: 'Batch',       icon: Files,     href: '/dashboard/batch' },
        { label: 'Plagiarism',  icon: BookCopy,  href: '/dashboard/plagiarism' },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'History',  icon: Clock,      href: '/dashboard/history' },
        { label: 'Reports',  icon: FolderOpen, href: '/dashboard/reports' },
        { label: 'API Keys', icon: Key,        href: '/dashboard/api-keys' },
        { label: 'Team',     icon: Users,      href: '/dashboard/team' },
        { label: 'Settings', icon: Settings,   href: '/dashboard/settings' },
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
    <div className="flex flex-col h-full bg-space-cadet-dark border-r border-cyan-azure/20 text-air-sup-blue">

      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-azure/15">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Logo variant={collapsed ? 'icon' : 'full'} size="sm" />
        </Link>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-md hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6 px-2">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-ucla-blue uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                          isActive
                            ? 'bg-cyan-azure/15 text-foreground border border-cyan-azure/30'
                            : 'hover:bg-cyan-azure/8 hover:text-foreground border border-transparent'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-cyan-azure to-pink-lavender rounded-full" />
                        )}
                        <item.icon
                          className={cn(
                            'w-5 h-5 shrink-0 transition-colors',
                            isActive ? 'text-cyan-azure' : 'text-ucla-blue group-hover:text-air-sup-blue'
                          )}
                        />
                        {!collapsed && (
                          <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
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

      {/* Footer */}
      <div className="border-t border-cyan-azure/15 p-2">
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-2 mb-2 rounded-md hover:bg-cyan-azure/10 text-ucla-blue hover:text-air-sup-blue transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div
          className={cn(
            'flex items-center rounded-lg p-2 hover:bg-cyan-azure/10 cursor-pointer transition-colors',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-azure to-pink-lavender shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-palette-md">
            JD
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-foreground truncate">Elijah</p>
              <p className="text-xs text-ucla-blue truncate">Free Plan</p>
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
              className="fixed inset-0 bg-space-cadet/70 backdrop-blur-sm z-40 md:hidden"
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
