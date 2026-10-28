'use client';

import { ArrowRight } from 'lucide-react';
import { ScanChoiceDialog } from '@/components/landing/scan-choice-dialog';
import styles from './landing-v2.module.css';

export function StartScanButton({ className = '' }: { className?: string }) {
  return (
    <ScanChoiceDialog>
      <button type="button" className={`${styles.primaryButton} ${className}`}>
        Start Scanning <ArrowRight size={18} aria-hidden="true" />
      </button>
    </ScanChoiceDialog>
  );
}
