'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { playSfx } from '@/lib/sfx';

export default function FavoritesPage() {
  const { favorites, user } = useAuth();
  const favGames = FEATURED_GAMES.filter((g) => favorites.includes(g.id));

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header Cockpit */}
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest uppercase">
                Favorites
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Favorite Games
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              {user ? 'Your personal library of bookmarked games.' : 'Saved on this browser. Sign in to sync across devices.'}
            </p>
          </div>
        </div>

        {!user ? (
          <Link
            href="/auth/sign-in"
            onClick={() => playSfx('tap')}
            className="btn-gaming px-6 py-3 rounded-full text-xs font-black shadow-lg whitespace-nowrap self-start md:self-auto"
          >
            Sign in to Sync
          </Link>
        ) : (
          <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-rose-400 font-mono self-start md:self-auto">
            {favGames.length} Saved Games
          </span>
        )}
      </div>

      {favGames.length === 0 ? (
        <div className="py-24 text-center drawer-neon rounded-[2.5rem] border border-white/15 max-w-lg mx-auto p-8 space-y-4 shadow-2xl">
          <div className="gaming-icon-box w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-rose-400 shadow-md">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Your Vault is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any game card to instantly bookmark it to your personal 3D library.
          </p>
          <Link
            href="/"
            onClick={() => playSfx('launch')}
            className="btn-gaming inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-black shadow-lg"
          >
            <Sparkles className="w-4 h-4 fill-current" /> Explore Games
          </Link>
        </div>
      ) : (
        <GameGrid games={favGames} mosaic={false} />
      )}
    </div>
  );
}
