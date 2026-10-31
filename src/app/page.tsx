'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Crown,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { CATEGORIES, getNewGames, getMasterpieceGames, getCatchyGames } from '@/lib/games';
import { SpotlightHero } from '@/components/portal/SpotlightHero';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameTile } from '@/components/portal/GameTile';
import { GameGrid } from '@/components/portal/GameGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameManifest } from '@/types';
import { playSfx } from '@/lib/sfx';

export default function HomePage() {
  const { user, kidsMode } = useAuth();
  const [continuePlaying, setContinuePlaying] = useState<GameManifest[]>([]);

  // Load real history if it exists
  useEffect(() => {
    try {
      const actorKey = user ? `user:${user.id}` : 'guest';
      const history = mockStore.getHistory(actorKey);
      if (Array.isArray(history) && history.length > 0) {
        setContinuePlaying(history.slice(0, 6));
      }
    } catch {
      // Non-blocking
    }
  }, [user]);

  const games = useMemo(() => mockStore.getGames(kidsMode), [kidsMode]);

  // Spotlight games for the Signature Hero
  const spotlightGames = useMemo(() => {
    const list: typeof games = [];
    for (const g of games) {
      if (g.is_featured) {
        list.push(g);
        if (list.length >= 5) break;
      }
    }
    return list;
  }, [games]);

  // Trending & Masterpiece curated collections
  const trendingGames = useMemo(() => getCatchyGames(12, kidsMode), [kidsMode]);
  const masterpieceGames = useMemo(() => getMasterpieceGames(12, kidsMode), [kidsMode]);

  // Fresh releases
  const newReleases = useMemo(() => {
    if (!kidsMode) return getNewGames().slice(0, 12);
    const list: typeof games = [];
    for (const g of getNewGames()) {
      if (g.is_kids_safe) {
        list.push(g);
        if (list.length >= 12) break;
      }
    }
    return list;
  }, [kidsMode]);

  // Primary categories to show in the genre showcase
  const topCategories = useMemo(() => CATEGORIES.slice(0, 6), []);

  return (
    <div className="space-y-10 sm:space-y-16 pb-24 max-w-[1920px] mx-auto w-full px-2 sm:px-4 lg:px-6">
      {/* 1. The Signature Hero: Enter the Arcade */}
      <SpotlightHero games={spotlightGames} />

      {/* Quick Category Filter Bar */}
      <CategoryChips />

      {/* 2. Continue Playing (Only if real player history exists) */}
      {continuePlaying.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            kicker="RESUME SESSION"
            title="Continue Playing"
            subtitle="Pick up right where you left off"
            icon={<Clock className="w-5 h-5 text-[var(--accent)]" />}
            href="/history"
            actionText="View Full History"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
            {continuePlaying.map((game) => (
              <GameTile key={game.id} game={game} size="1x1" />
            ))}
          </div>
        </section>
      )}

      {/* 3. Trending Now */}
      {trendingGames.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            kicker="COMMUNITY FAVORITES"
            title="Trending Now"
            subtitle="High-octane thrills and instant-play hits played most right now"
            icon={<Flame className="w-5 h-5 text-rose-400" />}
            iconColor="#fb7185"
            href="/trending"
            actionText="Explore Trending"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
            {trendingGames.map((game, idx) => (
              <GameTile
                key={game.id}
                game={game}
                size={idx === 0 ? 'wide' : idx === 5 ? '2x2' : '1x1'}
                priority={idx < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Browse by Category */}
      <section className="space-y-4">
        <SectionHeading
          kicker="GAME WORLDS"
          title="Browse by Genre"
          subtitle="Dive into curated arcade experiences built for every play style"
          icon={<Compass className="w-5 h-5 text-[var(--accent)]" />}
          href="/categories"
          actionText="All 12 Genres"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {topCategories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              icon={<Gamepad2 className="w-4 h-4" />}
            />
          ))}
        </div>
      </section>

      {/* 5. Hall of Fame (Top Rated) */}
      {masterpieceGames.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            kicker="CRITICAL ACCLAIM"
            title="All-Time Masterpieces"
            subtitle="Exceptional 3D graphics, rich mechanics, and verified 60 FPS performance"
            icon={<Crown className="w-5 h-5 text-amber-300" />}
            iconColor="#fcd34d"
            href="/top-rated"
            actionText="Hall of Fame"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
            {masterpieceGames.map((game, idx) => (
              <GameTile
                key={game.id}
                game={game}
                size={idx === 0 ? '2x2' : idx === 7 ? 'wide' : '1x1'}
                priority={idx < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Recently Added */}
      {newReleases.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            kicker="FRESH ARRIVALS"
            title="Recently Added"
            subtitle="The newest arcade additions, updated weekly with zero downloads"
            icon={<Sparkles className="w-5 h-5 text-[var(--accent)]" />}
            href="/new"
            actionText="View All New"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
            {newReleases.map((game, idx) => (
              <GameTile
                key={game.id}
                game={game}
                size={idx === 0 ? '2x2' : idx === 9 ? 'wide' : '1x1'}
                priority={idx < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Complete Catalog Infinite Grid */}
      <section className="space-y-5 pt-2">
        <SectionHeading
          kicker="COMPLETE COLLECTION"
          title="Explore All Games"
          subtitle="Browse the full verified catalog with instantaneous loading"
          icon={<Gamepad2 className="w-5 h-5 text-[var(--accent)]" />}
          rightElement={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[var(--accent)] bg-white/[0.04] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              {games.length.toLocaleString()} titles
            </span>
          }
        />
        <GameGrid games={games} pageSize={24} mosaic />
      </section>
    </div>
  );
}
