import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Grid } from 'lucide-react';
import { CATEGORIES, getGamesByCategory } from '@/lib/games';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameGrid } from '@/components/portal/GameGrid';

export const revalidate = 3600; // ISR 1 hour

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const slug = params?.slug as string;
  const decoded = decodeURIComponent(slug || '').toLowerCase();
  const category = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === decoded || c.name.toLowerCase() === decoded
  );
  const games = getGamesByCategory(slug || '');

  return (
    <div className="space-y-6 pb-16">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arcade-border">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/categories" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {category ? `${category.name} Games` : `${slug} Games`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-arcade-champagne/10 text-arcade-champagne border border-arcade-champagne/30">
              {games.length.toLocaleString()} titles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {category?.description || 'Browse high-quality free games in this category. Instant play on any device.'}
          </p>
        </div>

        <Link
          href="/categories"
          className="text-xs font-bold text-arcade-champagne hover:underline flex items-center gap-1"
        >
          <Grid className="w-3.5 h-3.5" /> All Categories
        </Link>
      </div>

      {/* Category Chips Bar */}
      <CategoryChips activeCategory={slug} />

      {/* Games Mosaic Grid */}
      {games.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-arcade-border">
          <p className="text-slate-400 font-medium text-sm">No games found in this category yet.</p>
          <Link href="/arcade" className="mt-4 inline-block px-5 py-2 bg-arcade-champagne text-arcade-dark font-black text-xs rounded-xl shadow-champagne-glow">
            Explore All Games
          </Link>
        </div>
      ) : (
        <GameGrid games={games} mosaic={true} pageSize={24} />
      )}
    </div>
  );
}
