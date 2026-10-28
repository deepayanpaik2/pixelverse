'use client';

import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { getTrendingGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function TrendingPage() {
  const games = useMemo(() => getTrendingGames(), []);

  return (
    <div className="space-y-8 pb-16">
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest uppercase">
                Trending
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Trending Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Popular games actively played across the network.
            </p>
          </div>
        </div>

        <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-rose-400 font-mono self-start md:self-auto">
          {games.length} Trending Titles
        </span>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={true} />
    </div>
  );
}
