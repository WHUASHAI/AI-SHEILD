'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: 'None' };
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score < 2) return { score: 1, label: 'Weak' };
    if (score < 4) return { score: 2, label: 'Fair' };
    if (score < 5) return { score: 3, label: 'Strong' };
    return { score: 4, label: 'Very Strong' };
  }, [password]);

  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          "font-medium",
          strength.score === 0 ? "text-muted-foreground" :
          strength.score === 1 ? "text-red-500" :
          strength.score === 2 ? "text-amber-500" :
          strength.score === 3 ? "text-emerald-500" :
          "text-emerald-400"
        )}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex-1 rounded-full transition-colors",
              idx <= strength.score ? (
                strength.score === 1 ? "bg-red-500" :
                strength.score === 2 ? "bg-amber-500" :
                strength.score === 3 ? "bg-emerald-500" :
                "bg-emerald-400"
              ) : "bg-slate-800"
            )}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-y-1 mt-2">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center text-xs text-muted-foreground gap-1">
            {check.met ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-slate-600" />
            )}
            <span className={cn(check.met && "text-slate-300")}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
