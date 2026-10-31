'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { playSfx } from '@/lib/sfx';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  href?: string;
  actionText?: string;
  rightElement?: React.ReactNode;
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  icon,
  iconColor,
  href,
  actionText = 'Explore All',
  rightElement,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-2 border-b border-white/[0.06]">
      <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
        {icon && (
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/[0.04] shadow-inner transition-colors duration-200"
            style={{ color: iconColor || 'var(--accent)' }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {kicker && (
            <span className="block text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[var(--accent)] uppercase mb-0.5">
              // {kicker}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-[13px] text-slate-400 font-medium truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        {rightElement}
        {href && (
          <Link
            href={href}
            onClick={() => playSfx('tap')}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[var(--accent)] transition-all duration-200"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-[var(--accent)]" />
          </Link>
        )}
      </div>
    </div>
  );
}
