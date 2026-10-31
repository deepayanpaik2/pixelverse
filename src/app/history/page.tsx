'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameTile } from '@/components/portal/GameTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameManifest } from '@/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyGames, setHistoryGames] = useState<GameManifest[]>([]);

  useEffect(() => {
    const actorKey = user ? user.id : 'guest';
    setHistoryGames(mockStore.getHistory(actorKey));
  }, [user]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // Recent Sessions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Recently Played
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Resume where you left off. Saved automatically on this device.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-[var(--accent)] bg-white/[0.04] border border-white/10 self-start md:self-auto tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          {historyGames.length} Recent Sessions
        </span>
      </div>

      {historyGames.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-[var(--accent)]" />}
          title="No Play History Recorded"
          description="Start playing any title in the catalog and your session history will track here automatically."
          actionText="Discover Games"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
          {historyGames.map((game) => (
            <GameTile key={game.id} game={game} size="1x1" />
          ))}
        </div>
      )}
    </div>
  );
}
