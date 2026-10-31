'use client';

import React, { useMemo } from 'react';
import { Star, Crown } from 'lucide-react';
import { getTopRatedGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function TopRatedPage() {
  const games = useMemo(() => getTopRatedGames(), []);

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-amber-300 shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase">
                // Hall of Fame
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Top Rated Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Highest rated browser games verified by player votes and critical acclaim.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-amber-300 bg-white/[0.04] border border-white/10 self-start md:self-auto tabular-nums">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {games.length} Masterpiece Titles
        </span>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={true} />
    </div>
  );
}
