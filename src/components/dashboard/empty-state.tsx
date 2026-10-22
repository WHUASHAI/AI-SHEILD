import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-[#1f2937] rounded-xl bg-[#0a0f1e]/50">
      <div className="w-16 h-16 bg-[#1f2937] rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      
      {action && (
        <Link 
          href={action.href}
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:ring-offset-2 focus:ring-offset-[#111827]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
