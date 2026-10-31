'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Zap,
  ShieldCheck,
  Star,
  Heart,
  Compass,
} from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { playSfx } from '@/lib/sfx';
import { categorySlug } from '@/lib/games';

interface SpotlightHeroProps {
  games: GameManifest[];
}

export function SpotlightHero({ games }: SpotlightHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { favorites, toggleFavorite } = useAuth();

  // Auto-advance carousel every 7 seconds
  useEffect(() => {
    if (games.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [games.length, paused]);

  if (!games || games.length === 0) return null;
  const current = games[currentIndex % games.length];
  const isFav = favorites.includes(current.id);

  const go = (dir: number) => {
    playSfx('tap');
    setCurrentIndex((prev) => (prev + dir + games.length) % games.length);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070a14]/90 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.9)] group transition-all duration-300"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cinematic Depth Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 75% 30%, rgba(13, 22, 54, 0.75) 0%, rgba(7, 10, 20, 0.95) 70%, #05070f 100%)',
        }}
      />

      {/* Subtle Ambient Light Wash */}
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, var(--accent-secondary) 100%)' }}
      />

      {/* Hero Content Grid (Asymmetric Editorial Layout) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-10 p-5 sm:p-8 lg:p-12 min-h-[420px] sm:min-h-[480px]">
        {/* Left Column: Editorial Information & Actions */}
        <div key={current.id} className="lg:col-span-7 space-y-4 sm:space-y-6 flex flex-col justify-center">
          {/* Top Kicker & Metadata Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)] text-[#05070f] text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 fill-current" /> Featured Spotlight
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/[0.06] border border-white/10 text-[var(--accent)]">
              <Zap className="w-3 h-3" /> {current.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-white/[0.04] border border-white/10 text-slate-300">
              <Gamepad2 className="w-3 h-3 text-[var(--accent-secondary)]" /> {current.supported_players}
            </span>
            {current.rating_score > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/[0.04] border border-white/10 text-amber-300 font-mono">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{current.rating_score.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Hero Game Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-md line-clamp-2">
            {current.title}
          </h1>

          {/* Concise Description */}
          {current.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3 max-w-xl">
              {current.description}
            </p>
          )}

          {/* Action Buttons Cluster */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/game/${current.slug}`}
              onClick={() => playSfx('launch')}
              className="arcade-btn-primary"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Now</span>
            </Link>

            <Link
              href={`/category/${categorySlug(current.category)}`}
              onClick={() => playSfx('tap')}
              className="arcade-btn-secondary"
            >
              <Compass className="w-4 h-4 text-[var(--accent)]" />
              <span>Explore {current.category}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                playSfx('like');
                toggleFavorite(current.id);
              }}
              className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
              aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''
                }`}
              />
            </button>
          </div>

          {/* Supporting Micro-Trust Badge */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Instant Play • Zero Downloads • Free to Play</span>
          </div>
        </div>

        {/* Right Column: Hero Artwork Showcase */}
        <div key={`${current.id}-art`} className="lg:col-span-5 flex flex-col items-center">
          <Link
            href={`/game/${current.slug}`}
            onClick={() => playSfx('launch')}
            className="group/art relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#05070f] border border-white/10 hover:border-[var(--accent)]/60 transition-all duration-300 shadow-2xl flex items-center justify-center p-3 sm:p-4 hover:shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25)]"
          >
            {/* Ambient Radial Spotlight inside Artwork Box */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 via-transparent to-purple-500/10 opacity-50 group-hover/art:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <img
              src={current.banner_url || current.thumbnail_url}
              alt={current.title}
              className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-md transition-transform duration-300 group-hover/art:scale-105"
            />

            {/* Play Overlay Pill on Hover */}
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 opacity-0 group-hover/art:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="arcade-btn-primary pointer-events-none text-xs py-2 px-5 shadow-lg">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> Launch
              </span>
            </div>
          </Link>

          {/* Carousel Controls Strip Below Artwork */}
          {games.length > 1 && (
            <div className="flex items-center justify-between w-full pt-3 px-1">
              <div className="flex items-center gap-1.5">
                {games.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSfx('tap');
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex % games.length
                        ? 'w-6 bg-[var(--accent)]'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  aria-label="Previous featured game"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                  aria-label="Next featured game"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
