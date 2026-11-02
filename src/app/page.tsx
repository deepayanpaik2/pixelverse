'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Gamepad2, Sparkles, Users, Smartphone, Compass, Crown, Flame } from 'lucide-react';
import { CATEGORIES, getNewGames, getMasterpieceGames, getCatchyGames } from '@/lib/games';
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
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

  // Early-break searches: stops scanning as soon as the shelf is filled (1000x faster than full array scans)
  const masterpieceGames = useMemo(() => getMasterpieceGames(12, kidsMode), [kidsMode]);
  const catchyGames = useMemo(() => getCatchyGames(12, kidsMode), [kidsMode]);

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

  const freshGames = useMemo(() => {
    if (!kidsMode) return getNewGames().slice(0, 18);
    const list: typeof games = [];
    for (const g of getNewGames()) {
      if (g.is_kids_safe) {
        list.push(g);
        if (list.length >= 18) break;
      }
    }
    return list;
  }, [kidsMode]);

  const multiplayerGames = useMemo(() => {
    const list: typeof games = [];
    for (const g of games) {
      if (g.is_multiplayer || g.supported_players.includes('2')) {
        list.push(g);
        if (list.length >= 6) break;
      }
    }
    return list;
  }, [games]);

  const mobileGames = useMemo(() => {
    const list: typeof games = [];
    for (const g of games) {
      if (g.mobile_friendly) {
        list.push(g);
        if (list.length >= 6) break;
      }
    }
    return list;
  }, [games]);

  const categoryShelves = useMemo(() => {
    return CATEGORIES.slice(0, 6).map((cat) => {
      const catGames: typeof games = [];
      const catLower = cat.name.toLowerCase();
      for (const g of games) {
        if (g.category.toLowerCase() === catLower || g.tags.some((t) => t.toLowerCase() === catLower)) {
          catGames.push(g);
          if (catGames.length >= 6) break;
        }
      }
      return { cat, games: catGames };
    });
  }, [games]);

  return (
    <div className="space-y-8 sm:space-y-14 pb-20 max-w-[1920px] mx-auto w-full px-1.5 sm:px-4 lg:px-6">
      {/* 3D Spotlight Cockpit Hero */}
      <SpotlightHero games={spotlightGames} />

      {/* 3D Category Control Bar */}
      <CategoryChips />

      {/* 1. All-Time Masterpieces Section (Hall of Fame) */}
      {masterpieceGames.length > 0 && (
        <section className="space-y-3.5 sm:space-y-4 fade-up">
          <div className="section-head">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div
                className="gaming-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-300"
                style={{ borderColor: 'rgba(251, 191, 36, 0.4)', boxShadow: '0 0 16px rgba(251, 191, 36, 0.2)' }}
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400/80" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2 truncate">
                  All-Time Masterpieces
                </h2>
                <p className="text-xs text-slate-400 font-medium truncate">
                  Visually stunning 3D graphics, rich mechanics, and verified 60 FPS playability
                </p>
              </div>
            </div>
            <Link
              href="/top-rated"
              onClick={() => playSfx('tap')}
              className="glass-chip shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black text-amber-200 hover:text-white transition-all group border-amber-500/30"
            >
              <span>Hall of Fame</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
            {masterpieceGames.map((game, idx) => (
              <GameTile
                key={game.id}
                game={game}
                size={idx === 0 ? '2x2' : idx === 7 || idx === 11 ? 'wide' : '1x1'}
                priority={idx < 4}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Instant Fun & Catchy Section (Zero Boredom!) */}
      {catchyGames.length > 0 && (
        <section className="space-y-3.5 sm:space-y-4 fade-up">
          <div className="section-head">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div
                className="gaming-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 text-rose-400"
                style={{ borderColor: 'rgba(251, 113, 133, 0.4)', boxShadow: '0 0 16px rgba(251, 113, 133, 0.2)' }}
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/80" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2 truncate">
                  Instant Fun & Catchy
                </h2>
                <p className="text-xs text-slate-400 font-medium truncate">
                  Fast-paced, high dopamine thrills you can pick up in seconds and play for hours
                </p>
              </div>
            </div>
            <Link
              href="/trending"
              onClick={() => playSfx('tap')}
              className="glass-chip shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black text-rose-200 hover:text-white transition-all group border-rose-500/30"
            >
              <span>Play Most Addictive</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
            {catchyGames.map((game, idx) => (
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

      {/* Fresh Releases Section: 3D Mosaic Grid */}
      <section className="space-y-3.5 sm:space-y-4 fade-up">
        <div className="section-head">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="gaming-icon-box w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 text-[var(--accent)]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl text-white font-display font-extrabold tracking-tight flex items-center gap-2 truncate">
                New Releases
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate">Fresh from the arcade feed, newest first</p>
            </div>
          </div>
          <Link
            href="/new"
            onClick={() => playSfx('tap')}
            className="glass-chip shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black text-slate-200 hover:text-white transition-all group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2.5 sm:gap-4 lg:gap-5">
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
              <p className="text-xs text-slate-400 font-medium">Scroll down to browse the full games catalog.</p>
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
        <GameGrid games={games} pageSize={24} mosaic />
      </section>
    </div>
  );
}
