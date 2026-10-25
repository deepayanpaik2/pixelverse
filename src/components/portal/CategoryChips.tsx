'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/games';

interface CategoryChipsProps {
  activeCategory?: string;
}

export function CategoryChips({ activeCategory }: CategoryChipsProps) {
  const active = activeCategory ? decodeURIComponent(activeCategory).toLowerCase() : undefined;

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%_-_24px),transparent)] px-1">
      <Link
        href="/"
        data-active={!active}
        className="glass-chip px-5 py-2.5 rounded-full text-[13px] font-extrabold whitespace-nowrap text-slate-200 hover:text-white transition-all flex items-center gap-2 shadow-sm"
      >
        <span>🎮 All Games</span>
      </Link>

      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          data-active={active === cat.slug || active === cat.name.toLowerCase()}
          className="glass-chip flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-extrabold whitespace-nowrap text-slate-200 hover:text-white transition-all shadow-sm"
        >
          <span>{cat.name}</span>
          <span className="text-[10px] opacity-75 tabular-nums bg-white/10 px-2 py-0.5 rounded-full font-mono">
            {cat.game_count.toLocaleString()}
          </span>
        </Link>
      ))}
    </div>
  );
}
