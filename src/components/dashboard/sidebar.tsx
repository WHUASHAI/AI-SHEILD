'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Plus, FileText, Image as ImageIcon, Video, UserX, Sparkles,
  Files, Clock, FolderOpen, Key, Users, Settings, HelpCircle,
  ChevronLeft, ChevronRight, X, BookCopy, Zap,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

const navGroups = [
  {
    title: 'Main',
    items: [
      { label: 'Overview',  icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
  title: 'Detectors',
  items: [
    { label: 'Text',        icon: FileText,  href: '/dashboard/text' },
    { label: 'Image',       icon: ImageIcon, href: '/dashboard/image' },
    { label: 'Video',       icon: Video,     href: '/dashboard/video' },
    { label: 'Deepfake',    icon: UserX,     href: '/dashboard/deepfake' },
    { label: 'Plagiarism',  icon: BookCopy,  href: '/dashboard/plagiarism' },
  ],
  },

  {
    title: 'Management',
    items: [
      { label: 'History',  icon: Clock,      href: '/dashboard/history' },
      { label: 'Reports',  icon: FolderOpen, href: '/dashboard/reports' },
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

export function DashboardSidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #07111e 100%)', borderRight: '1px solid rgba(78,122,177,0.18)' }}>
      
      {/* Subtle left glow orb */}
      <div className="absolute top-20 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(78,122,177,0.07) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(78,122,177,0.12)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Logo variant={collapsed ? 'icon' : 'full'} size="sm" />
        </Link>
        <button onClick={onCloseMobile}
          className="md:hidden p-2 rounded-lg hover:bg-cyan-azure/10 text-air-sup-blue hover:text-pink-lavender transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-ucla-blue/60 uppercase tracking-widest">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isHighlight = (item as any).highlight;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      onClick={onCloseMobile}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden',
                        isActive
                          ? 'bg-cyan-azure/15 text-foreground'
                          : isHighlight
                            ? 'bg-gradient-to-r from-cyan-azure/20 to-pink-lavender/15 text-foreground hover:from-cyan-azure/30 hover:to-pink-lavender/25 border border-cyan-azure/25'
                            : 'text-air-sup-blue hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                          style={{ background: 'linear-gradient(180deg, #4E7AB1, #CEB5D4)' }}
                        />
                      )}
                      {/* Shimmer on hover for highlight item */}
                      {isHighlight && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(78,122,177,0.15) 50%, transparent 100%)' }} />
                      )}
                      <item.icon className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-cyan-azure' : isHighlight ? 'text-cyan-azure' : 'text-ucla-blue group-hover:text-air-sup-blue'
                      )} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      {!collapsed && isHighlight && <Zap className="w-3 h-3 ml-auto text-pink-lavender/70" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="shrink-0 p-2" style={{ borderTop: '1px solid rgba(78,122,177,0.12)' }}>
        <button
          onClick={() => {
            console.log('Toggle button clicked');
            onToggleCollapse();
          }}
          className="hidden md:flex w-full items-center justify-center p-2 mb-2 rounded-lg hover:bg-cyan-azure/10 text-ucla-blue hover:text-air-sup-blue transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div className={cn(
          'flex items-center rounded-xl p-2.5 hover:bg-cyan-azure/8 cursor-pointer transition-colors',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          {/* Removed user profile section */}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:block shrink-0 h-full z-10"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
