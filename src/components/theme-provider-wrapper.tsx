'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
