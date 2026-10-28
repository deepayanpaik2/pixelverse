'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Play } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameTile } from '@/components/portal/GameTile';
import { GameManifest } from '@/types';
import { playSfx } from '@/lib/sfx';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyGames, setHistoryGames] = useState<GameManifest[]>([]);

  useEffect(() => {
    const actorKey = user ? user.id : 'guest';
    setHistoryGames(mockStore.getHistory(actorKey));
  }, [user]);

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header Cockpit */}
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // SESSION LOGS
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Recently Played
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Jump right back into your recently launched titles with instant load times.
            </p>
          </div>
        </div>

        <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-[var(--accent)] font-mono self-start md:self-auto">
          {historyGames.length} Recent Sessions
        </span>
      </div>

      {historyGames.length === 0 ? (
        <div className="py-24 text-center drawer-neon rounded-[2.5rem] border border-white/15 max-w-lg mx-auto p-8 space-y-4 shadow-2xl">
          <div className="gaming-icon-box w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-[var(--accent)] shadow-md">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-white">No Play History Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Start playing any title in the catalog and your session history will track here automatically.
          </p>
          <Link
            href="/"
            onClick={() => playSfx('launch')}
            className="btn-gaming inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-black shadow-lg"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" /> Start Playing Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {historyGames.map((game) => (
            <GameTile key={game.id} game={game} size="1x1" />
          ))}
        </div>
      )}
    </div>
  );
}
