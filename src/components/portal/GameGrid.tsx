'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { GameManifest } from '@/types';
import { GameTile } from './GameTile';
import { playSfx } from '@/lib/sfx';

interface GameGridProps {
  games: GameManifest[];
  pageSize?: number;
  mosaic?: boolean;
  className?: string;
}

const DEFAULT_COLS = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
const MOSAIC_COLS = 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense';

function mosaicSize(idx: number): '1x1' | '2x2' | 'wide' {
  const n = idx % 24;
  if (n === 0) return '2x2';
  if (n === 9 || n === 17) return 'wide';
  return '1x1';
}

export function GameGrid({ games, pageSize = 36, mosaic = false, className }: GameGridProps) {
  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 20;
    return pageSize;
  });
  const sentinel = useRef<HTMLDivElement>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const listKey = `${games.length}:${games[0]?.id ?? ''}:${games[games.length - 1]?.id ?? ''}`;
  useEffect(() => {
    setCount(pageSize);
  }, [listKey, pageSize]);

  const total = games.length;
  const visible = Math.min(count, total);
  const hasMore = visible < total;

  const loadMore = useCallback(() => {
    setCount((c) => Math.min(c + pageSize, total));
  }, [pageSize, total]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || typeof IntersectionObserver === 'undefined') return;
    if (ioRef.current) ioRef.current.disconnect();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => loadMore());
          } else {
            loadMore();
          }
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    ioRef.current = io;
    return () => {
      io.disconnect();
      ioRef.current = null;
    };
  }, [hasMore, visible, pageSize, loadMore, total]);

  return (
    <div className="space-y-6">
      <div className={className || `grid gap-2.5 sm:gap-4 lg:gap-5 ${mosaic ? MOSAIC_COLS : DEFAULT_COLS}`}>
        {games.slice(0, visible).map((game, idx) => (
          <GameTile
            key={game.id}
            game={game}
            size={mosaic ? mosaicSize(idx) : '1x1'}
            priority={idx < 6}
          />
        ))}
      </div>

      {total > 0 && (
        <div ref={sentinel} className="flex flex-col items-center gap-3 pt-8 pb-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              Displaying {visible.toLocaleString()} of {total.toLocaleString()} games
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] transition-all duration-300"
              style={{ width: `${Math.round((visible / total) * 100)}%` }}
            />
          </div>

          {hasMore && (
            <button
              onClick={() => {
                loadMore();
                playSfx('tap');
              }}
              className="btn-gaming flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black shadow-lg"
            >
              <span>Load More Titles</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
