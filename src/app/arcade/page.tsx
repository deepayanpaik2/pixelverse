'use client';

import React, { useState, useMemo, useDeferredValue, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Gamepad2, 
  Search, 
  X
} from 'lucide-react';
import { FEATURED_GAMES, getAllCategories, gameInCategory } from '@/lib/games';
import { GameGrid } from '@/components/portal/GameGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { playSfx } from '@/lib/sfx';

function ArcadeContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

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
    <div className="space-y-8 pb-20">
      {/* Refined Header */}
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // Catalog Search
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Pixelverse Arcade
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              {FEATURED_GAMES.length.toLocaleString()} verified browser games. Instant play, zero installs.
            </p>
          </div>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, genre, tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#05070f] border border-white/15 rounded-full pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => {
              setSortBy(e.target.value);
              playSfx('tap');
            }}
            className="bg-[#05070f] border border-white/15 text-xs font-bold rounded-full px-4 py-2.5 text-slate-200 focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer shadow-inner"
          >
            <option value="newest">Latest Added</option>
            <option value="played">Most Played</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-1 touch-pan-x">
        <button
          onClick={() => {
            setSelectedCategory('All');
            playSfx('tap');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
            selectedCategory === 'All'
              ? 'bg-[var(--accent)] text-[#05070f] border-[var(--accent)] shadow-sm'
              : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:border-white/20'
          }`}
        >
          All Games ({FEATURED_GAMES.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setSelectedCategory(cat.name);
              playSfx('tap');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.name
                ? 'bg-[var(--accent)] text-[#05070f] border-[var(--accent)] shadow-sm'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:border-white/20'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Games Mosaic Grid or Clean Empty State */}
      {filteredGames.length === 0 ? (
        <EmptyState
          title="No games match your query"
          description="Try searching with different keywords or reset your category filter."
          actionText="Reset All Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <GameGrid games={filteredGames} mosaic />
      )}
    </div>
  );
}

export default function ArcadePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400 font-mono">LOADING CATALOG…</div>}>
      <ArcadeContent />
    </Suspense>
  );
}
