import React from 'react';
import { Check } from 'lucide-react';

export function SignupStepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ['Account', 'Avatar Creator', 'Player Profile'];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold">
      {items.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono transition-all duration-300 ${
                  done
                    ? 'bg-arcade-sage text-arcade-dark font-black'
                    : active
                    ? 'bg-arcade-champagne text-arcade-dark font-black shadow-champagne-glow scale-105'
                    : 'bg-arcade-surface border border-arcade-border text-slate-500'
                }`}
              >
                {done ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : n}
              </span>
              <span className={`whitespace-nowrap ${active || done ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <span
                className={`w-5 sm:w-8 h-px ${
                  done ? 'bg-arcade-sage' : 'bg-arcade-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
