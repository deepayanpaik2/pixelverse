'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Gamepad2, Sparkles, Users, Smartphone, Flame, Compass } from 'lucide-react';
import { CATEGORIES, gameInCategory } from '@/lib/games';
import { SpotlightHero } from '@/components/portal/SpotlightHero';
import { CategoryChips } from '@/components/portal/CategoryChips';
import { GameTile } from '@/components/portal/GameTile';
import { GameGrid } from '@/components/portal/GameGrid';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { playSfx } from '@/lib/sfx';

function Shelf({
  title,
  subtitle,
  href,
  color,
  icon,
  games,
}: {
  title: string;
  subtitle: string;
  href?: string;
  color: string;
  icon?: React.ReactNode;
  games: ReturnType<typeof mockStore.getGames>;
}) {
  if (games.length === 0) return null;
  return (
    <section className="space-y-4 fade-up">
      <div className="section-head">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="gaming-icon-box w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ color, borderColor: `${color}66` }}
          >
            {icon || <Gamepad2 className="w-5 h-5 fill-current" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2 truncate">
              {title}
            </h2>
            <p className="text-xs text-slate-400 truncate font-medium">{subtitle}</p>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            onClick={() => playSfx('tap')}
            className="glass-chip shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-200 hover:text-white transition-all group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
        {games.map((game) => (
          <GameTile key={game.id} game={game} size="1x1" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { kidsMode } = useAuth();

  const games = useMemo(() => mockStore.getGames(kidsMode), [kidsMode]);

  const spotlightGames = useMemo(() => games.filter((g) => g.is_featured).slice(0, 5), [games]);
  const freshGames = useMemo(
    () => [...games].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 18),
    [games]
  );
  const multiplayerGames = useMemo(
    () => games.filter((g) => g.is_multiplayer || g.supported_players.includes('2')).slice(0, 6),
    [games]
  );
  const mobileGames = useMemo(() => games.filter((g) => g.mobile_friendly).slice(0, 6), [games]);

  const categoryShelves = useMemo(
    () =>
      CATEGORIES.slice(0, 6).map((cat) => ({
        cat,
        games: games.filter((g) => g.category === cat.name || gameInCategory(g, cat.name)).slice(0, 6),
      })),
    [games]
  );

  return (
    <div className="space-y-12 sm:space-y-16 pb-24 max-w-[1920px] mx-auto w-full px-2 sm:px-4 lg:px-6">
      {/* 3D Spotlight Cockpit Hero */}
      <SpotlightHero games={spotlightGames} />

      {/* 3D Category Control Bar */}
      <CategoryChips />

      {/* Fresh Releases Section: 3D Mosaic Grid */}
      <section className="space-y-4 fade-up">
        <div className="section-head">
          <div className="flex items-center gap-3.5">
            <div className="gaming-icon-box w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-[var(--accent)]">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2">
                New Releases
              </h2>
              <p className="text-xs text-slate-400 font-medium">Fresh from the arcade feed, newest first</p>
            </div>
          </div>
          <Link
            href="/new"
            onClick={() => playSfx('tap')}
            className="glass-chip shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-200 hover:text-white transition-all group"
          >
            <span>View All New</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-3.5 sm:gap-5">
          {freshGames.map((game, idx) => (
            <GameTile
              key={game.id}
              game={game}
              size={idx === 0 ? '2x2' : idx === 9 || idx === 15 ? 'wide' : '1x1'}
              priority={idx < 4}
            />
          ))}
        </div>
      </section>

      {/* Dynamic Category Shelves */}
      {categoryShelves.map(({ cat, games: shelfGames }) => (
        <Shelf
          key={cat.slug}
          title={`${cat.name} Games`}
          subtitle={cat.description}
          href={`/category/${cat.slug}`}
          color={cat.color}
          icon={<Compass className="w-5 h-5" />}
          games={shelfGames}
        />
      ))}

      {/* Multiplayer Shelf */}
      <Shelf
        title="2 Player & Multiplayer"
        subtitle="Play together on one screen or battle online across rooms"
        href="/category/multiplayer"
        color="var(--accent)"
        icon={<Users className="w-5 h-5" />}
        games={multiplayerGames}
      />

      {/* Mobile Shelf */}
      <Shelf
        title="Made for Mobile"
        subtitle="Smooth tap and swipe controls on phone or tablet"
        color="var(--accent-secondary)"
        icon={<Smartphone className="w-5 h-5" />}
        games={mobileGames}
      />

      {/* Complete Catalog Infinite Grid */}
      <section className="space-y-5">
        <div className="section-head">
          <div className="flex items-center gap-3.5">
            <div className="gaming-icon-box w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-[var(--accent)]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2">
                All Games Catalog
              </h2>
              <p className="text-xs text-slate-400 font-medium">Keep scrolling — the entire universe streams as you explore</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex glass-chip px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-slate-300 border border-white/10 items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Engineered by Deepayan
            </span>
            <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-[var(--accent)] shadow-sm font-mono">
              {games.length.toLocaleString()} games online
            </span>
          </div>
        </div>
        <GameGrid games={games} mosaic />
      </section>
    </div>
  );
}
