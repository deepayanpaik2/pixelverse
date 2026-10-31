'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Gamepad2, ArrowLeft, Grid } from 'lucide-react';
import { CATEGORIES, getGamesByCategory } from '@/lib/games';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameGrid } from '@/components/portal/GameGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { playSfx } from '@/lib/sfx';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const category = CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === decodeURIComponent(slug || '').toLowerCase() ||
      c.name.toLowerCase() === decodeURIComponent(slug || '').toLowerCase()
  );
  const games = useMemo(() => getGamesByCategory(slug || ''), [slug]);

  const title = category ? `${category.name} Games` : `${decodeURIComponent(slug || '')} Games`;
  const description =
    category?.description ||
    'Browse high-quality free games in this genre. Instant play on PC and mobile with zero downloads.';

  return (
    <div className="space-y-6 pb-20">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/categories"
              onClick={() => playSfx('tap')}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              aria-label="Back to all categories"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 tabular-nums">
              {games.length.toLocaleString()} titles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            {description}
          </p>
        </div>

        <Link
          href="/categories"
          onClick={() => playSfx('tap')}
          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Grid className="w-3.5 h-3.5" /> All Categories
        </Link>
      </div>

      {/* Category Chips Bar */}
      <CategoryChips activeCategory={slug} />

      {/* Games Grid or Empty State */}
      {games.length === 0 ? (
        <EmptyState
          title="No games in this category yet"
          description="Check back soon. New games arrive with every weekly feed update."
          actionText="Browse All Games"
          actionHref="/"
        />
      ) : (
        <GameGrid games={games} mosaic={false} />
      )}
    </div>
  );
}
