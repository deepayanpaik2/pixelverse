'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { getNewGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export default function NewGamesPage() {
  const games = useMemo(() => getNewGames(), []);

  return (
    <div className="space-y-8 pb-16">
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg">
            <Sparkles className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                New Arrivals
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              New Online Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Fresh additions straight from the game distribution network, updated continuously.
            </p>
          </div>
        </div>

        <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-[var(--accent)] font-mono self-start md:self-auto">
          {games.length} New Releases
        </span>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={true} />
    </div>
  );
}
