import React from 'react';
import { Flame } from 'lucide-react';
import { getTrendingGames } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { CategoryChips } from '@/components/portal/CategoryChips';

export const revalidate = 3600; // ISR 1 hour

export default function TrendingPage() {
  const games = getTrendingGames();

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-arcade-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Flame className="w-7 h-7 text-arcade-rose fill-current" /> Trending Games
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Games with the highest play traffic and engagement across the network this week.
        </p>
      </div>

      <CategoryChips />

      <GameGrid games={games} mosaic={false} pageSize={24} />
    </div>
  );
}
