'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { playSfx } from '@/lib/sfx';

export default function FavoritesPage() {
  const { favorites, user } = useAuth();
  const favGames = FEATURED_GAMES.filter((g) => favorites.includes(g.id));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-rose-400 shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest uppercase">
                // Personal Library
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Favorite Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              {user ? 'Your personal library of bookmarked games.' : 'Saved on this browser. Sign in to sync across all your devices.'}
            </p>
          </div>
        </div>

        {!user ? (
          <Link
            href="/auth/sign-in"
            onClick={() => playSfx('tap')}
            className="arcade-btn-primary self-start md:self-auto text-xs py-2.5 px-5"
          >
            Sign in to Sync
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-rose-400 bg-white/[0.04] border border-white/10 self-start md:self-auto tabular-nums">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            {favGames.length} Saved Games
          </span>
        )}
      </div>

      {favGames.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-400" />}
          title="Your Vault is Empty"
          description="Click the heart icon on any game tile or player page to save your favorite games here for instant 1-click access."
          actionText="Discover Games"
          actionHref="/"
        />
      ) : (
        <GameGrid games={favGames} mosaic={false} />
      )}
    </div>
  );
}
