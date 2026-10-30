'use client';

import React from 'react';
import Link from 'next/link';
import { STATIC_CATEGORIES } from '@/lib/games/static-categories';

export interface CategoryChipItem {
  id: string;
  slug: string;
  name: string;
  game_count?: number;
}

interface CategoryChipsProps {
  activeCategory?: string;
  categories?: CategoryChipItem[];
}

export function CategoryChips({ activeCategory, categories = STATIC_CATEGORIES }: CategoryChipsProps) {
  const active = activeCategory ? decodeURIComponent(activeCategory).toLowerCase() : undefined;

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1 touch-pan-x [-webkit-overflow-scrolling:touch]">
      <Link
        href="/"
        data-active={!active}
        className="glass-chip px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold whitespace-nowrap text-slate-200 hover:text-white transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0"
      >
        <span>All Games</span>
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          data-active={active === cat.slug || active === cat.name.toLowerCase()}
          className="glass-chip flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold whitespace-nowrap text-slate-200 hover:text-white transition-all shadow-sm shrink-0"
        >
          <span>{cat.name}</span>
          {typeof cat.game_count === 'number' && cat.game_count > 0 && (
            <span className="text-[9.5px] sm:text-[10px] opacity-75 tabular-nums bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-full font-mono">
              {cat.game_count.toLocaleString()}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
