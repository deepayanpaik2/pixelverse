'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { playSfx } from '@/lib/sfx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText = 'Browse All Games',
  actionHref = '/',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-2xl bg-[#0a0e1c]/60 border border-white/[0.08] max-w-lg mx-auto space-y-4 my-8">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--accent)] shadow-inner">
        {icon || <Gamepad2 className="w-8 h-8 opacity-80" />}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          onClick={() => {
            playSfx('tap');
            onAction?.();
          }}
          className="arcade-btn-primary mt-2"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
