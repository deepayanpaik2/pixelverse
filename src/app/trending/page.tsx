'use client';

import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { getTrendingGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function TrendingPage() {
  const games = useMemo(() => getTrendingGames(), []);

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-rose-400 shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest uppercase">
                // Network Heatmap
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Trending Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Popular games actively played across the network right now.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-rose-400 bg-white/[0.04] border border-white/10 self-start md:self-auto tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          {games.length} Trending Titles
        </span>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={true} />
    </div>
  );
}
