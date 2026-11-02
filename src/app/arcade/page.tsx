'use client';

import React, { useState, useMemo, useDeferredValue, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  Filter,
  Check,
  Compass
} from 'lucide-react';
import { FEATURED_GAMES, getAllCategories, gameInCategory } from '@/lib/games';
import { useAuth } from '@/features/auth/AuthContext';
import { GameGrid } from '@/components/portal/GameGrid';
import { playSfx } from '@/lib/sfx';

function ArcadeContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'played'>('newest');
  const deferredQuery = useDeferredValue(searchQuery);

  const categories = getAllCategories();

  const filteredGames = useMemo(() => {
    let list = FEATURED_GAMES;

    if (selectedCategory !== 'All') {
      list = list.filter((g) => gameInCategory(g, selectedCategory));
    }

    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.description.toLowerCase().includes(q)
      );
      list = [...list].sort((a, b) => Number(b.title.toLowerCase().includes(q)) - Number(a.title.toLowerCase().includes(q)));
    }

    if (sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'played') list = [...list].sort((a, b) => b.play_count - a.play_count);
    return list;
  }, [selectedCategory, deferredQuery, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header Cockpit */}
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg">
            <Gamepad2 className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                Arcade Directory
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Pixelverse Arcade
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Explore {FEATURED_GAMES.length.toLocaleString()} titles. Zero installs, instant launch on any device.
            </p>
          </div>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060810]/80 border border-white/15 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => {
              setSortBy(e.target.value);
              playSfx('tap');
            }}
            className="bg-[#060810]/80 border border-white/15 text-xs font-bold rounded-full px-4 py-2.5 text-slate-200 focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer"
          >
            <option value="newest">Latest Added</option>
            <option value="played">Most Played</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%_-_24px),transparent)] px-1">
        <button
          onClick={() => {
            setSelectedCategory('All');
            playSfx('tap');
          }}
          data-active={selectedCategory === 'All'}
          className="glass-chip px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap text-slate-200"
        >
          All Games ({FEATURED_GAMES.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.name);
              playSfx('tap');
            }}
            data-active={selectedCategory === cat.name}
            className="glass-chip px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap text-slate-200"
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-mono font-bold text-[var(--accent)]">
          MATCHING: {filteredGames.length.toLocaleString()} GAMES
        </span>
      </div>

      {/* Games Mosaic Grid */}
      {filteredGames.length === 0 ? (
        <div className="py-24 text-center drawer-neon rounded-[2rem] border border-white/15 max-w-md mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">No games match your query</h3>
          <p className="text-xs text-slate-400">Try searching with different keywords or reset your filters</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              playSfx('tap');
            }}
            className="btn-gaming px-6 py-3 rounded-full text-xs font-black shadow-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <GameGrid games={filteredGames} mosaic />
      )}
    </div>
  );
}

export default function ArcadePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400 font-mono">INITIALIZING ARCADE MATRIX...</div>}>
      <ArcadeContent />
    </Suspense>
  );
}
