'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldAlert, FileText, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info' | 'invite' | 'system';
  time: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Scan Complete',
    message: 'Text analysis for "Project_Proposal.docx" finished. Likely human-created.',
    type: 'success',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    title: 'High AI Probability Detected',
    message: 'Image scan "avatar_new.jpg" flagged as Likely AI-generated (98%).',
    type: 'alert',
    time: '15m ago',
    read: false,
  },
  {
    id: '3',
    title: 'Batch Processing Finished',
    message: '12 items processed. 2 flagged for review.',
    type: 'info',
    time: '1h ago',
    read: true,
  },
  {
    id: '4',
    title: 'New Team Member',
    message: 'Sarah accepted your invitation to AI Sheild.',
    type: 'invite',
    time: '2h ago',
    read: true,
  },
];

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'alert': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'info': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'invite': return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'system': return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#111827] border-l border-[#1f2937] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2937] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0f1e] border-b border-[#1f2937]">
              <span className="text-xs font-medium text-gray-400">
                {notifications.filter(n => !n.read).length} unread
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-[#06b6d4] hover:text-[#0891b2] font-medium"
                >
                  Mark all read
                </button>
                <button 
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-white font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1f2937]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#1f2937] flex items-center justify-center text-gray-500">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">All caught up!</p>
                    <p className="text-xs text-gray-500 mt-1">No new notifications right now.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#1f2937]">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-4 flex gap-3 hover:bg-[#1f2937]/50 transition-colors cursor-pointer",
                        !notification.read ? "bg-[#1f2937]/20" : ""
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            !notification.read ? "text-white" : "text-gray-300"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#06b6d4] mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#1f2937] text-xs text-center text-gray-500">
              AI Sheild provides probability-based analysis. Results may contain false positives/negatives.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Temporary import for the empty state icon
import { Bell } from 'lucide-react';
