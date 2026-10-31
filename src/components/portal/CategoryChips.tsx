'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/games';
import { playSfx } from '@/lib/sfx';

interface CategoryChipsProps {
  activeCategory?: string;
}

export function CategoryChips({ activeCategory }: CategoryChipsProps) {
  const active = activeCategory ? decodeURIComponent(activeCategory).toLowerCase() : undefined;

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none px-0.5 touch-pan-x [-webkit-overflow-scrolling:touch]">
      <Link
        href="/"
        onClick={() => playSfx('tap')}
        data-active={!active}
        className={`px-4 py-2 rounded-full text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm shrink-0 border ${
          !active
            ? 'bg-[var(--accent)] text-[#05070f] border-[var(--accent)] shadow-[0_0_16px_-4px_var(--accent-glow)]'
            : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08]'
        }`}
      >
        <span>All Games</span>
      </Link>

      {CATEGORIES.map((cat) => {
        const isCurrent = active === cat.slug || active === cat.name.toLowerCase();
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            onClick={() => playSfx('tap')}
            data-active={isCurrent}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm shrink-0 border ${
              isCurrent
                ? 'bg-[var(--accent)] text-[#05070f] border-[var(--accent)] shadow-[0_0_16px_-4px_var(--accent-glow)]'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08]'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                isCurrent ? 'bg-black/20 text-[#05070f]' : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              {cat.game_count.toLocaleString()}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
