'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryInfo } from '@/types';
import { playSfx } from '@/lib/sfx';

interface CategoryCardProps {
  category: CategoryInfo;
  icon?: React.ReactNode;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  action: 'from-amber-500/20 via-orange-600/10 to-transparent',
  adventure: 'from-emerald-500/20 via-teal-600/10 to-transparent',
  arcade: 'from-cyan-500/20 via-blue-600/10 to-transparent',
  board: 'from-indigo-500/20 via-purple-600/10 to-transparent',
  card: 'from-purple-500/20 via-pink-600/10 to-transparent',
  casual: 'from-pink-500/20 via-rose-600/10 to-transparent',
  driving: 'from-red-500/20 via-orange-600/10 to-transparent',
  puzzle: 'from-sky-500/20 via-indigo-600/10 to-transparent',
  shooting: 'from-rose-500/20 via-red-600/10 to-transparent',
  sports: 'from-lime-500/20 via-green-600/10 to-transparent',
  strategy: 'from-violet-500/20 via-purple-600/10 to-transparent',
  multiplayer: 'from-cyan-500/20 via-violet-600/10 to-transparent',
};

export function CategoryCard({ category, icon }: CategoryCardProps) {
  const gradient = CATEGORY_GRADIENTS[category.slug.toLowerCase()] || 'from-cyan-500/20 via-indigo-600/10 to-transparent';

  return (
    <Link
      href={`/category/${category.slug}`}
      onClick={() => playSfx('tap')}
      className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#0a0e1c]/80 hover:bg-[#10172e] border border-white/[0.08] hover:border-[var(--accent)]/50 transition-all duration-300 shadow-lg hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8)] hover:-translate-y-1 flex flex-col justify-between min-h-[105px] sm:min-h-[120px]"
    >
      {/* Background Gradient & Geometric Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none`} />

      {/* Top Header: Icon & Count */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/10 group-hover:scale-110 transition-transform duration-300"
          style={{ color: category.color || 'var(--accent)' }}
        >
          {icon}
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-white bg-black/40 px-2 py-0.5 rounded-full border border-white/5 tabular-nums">
          {category.game_count.toLocaleString()}
        </span>
      </div>

      {/* Bottom Title & Description */}
      <div className="relative z-10 mt-3">
        <h3 className="font-display font-extrabold text-white text-sm sm:text-base tracking-tight group-hover:text-[var(--accent)] transition-colors duration-200">
          {category.name}
        </h3>
        <p className="text-[11px] text-slate-400 truncate font-normal mt-0.5">
          {category.description || `Browse ${category.name} games`}
        </p>
      </div>
    </Link>
  );
}
