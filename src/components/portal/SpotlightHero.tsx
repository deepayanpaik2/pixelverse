'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Crown,
  Zap,
  ShieldCheck,
  Star,
  Flame,
  Heart,
} from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { playSfx } from '@/lib/sfx';

interface SpotlightHeroProps {
  games: GameManifest[];
}

// Category aesthetic theme map for custom neon vibes per game
const GENRE_ACCENTS: Record<string, { primary: string; secondary: string; glow: string; badge: string }> = {
  Action: { primary: '#f43f5e', secondary: '#fb923c', glow: 'rgba(244,63,94,0.4)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  Adventure: { primary: '#b9a8ff', secondary: '#06b6d4', glow: 'rgba(185,168,255,0.4)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  Arcade: { primary: '#00f3ff', secondary: '#3b82f6', glow: 'rgba(0,243,255,0.4)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  Racing: { primary: '#ff7b00', secondary: '#facc15', glow: 'rgba(255,123,0,0.4)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  Shooting: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239,68,68,0.4)', badge: 'bg-red-500/20 text-red-300 border-red-500/40' },
  Puzzle: { primary: '#10b981', secondary: '#06b6d4', glow: 'rgba(16,185,129,0.4)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  Zombie: { primary: '#84cc16', secondary: '#10b981', glow: 'rgba(132,204,22,0.4)', badge: 'bg-lime-500/20 text-lime-300 border-lime-500/40' },
  Multiplayer: { primary: '#00f3ff', secondary: '#a855f7', glow: 'rgba(0,243,255,0.4)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
};

export function SpotlightHero({ games }: SpotlightHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { favorites, toggleFavorite } = useAuth();
  const coverRef = useRef<HTMLDivElement>(null);

  // Auto-advance timer (8 seconds)
  useEffect(() => {
    if (games.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [games.length, paused]);

  if (!games || games.length === 0) return null;
  const current = games[currentIndex % games.length];
  const isFav = favorites.includes(current.id);

  const go = (dir: number) => {
    playSfx('tap');
    setCurrentIndex((prev) => (prev + dir + games.length) % games.length);
  };

  const genre = GENRE_ACCENTS[current.category] || {
    primary: 'var(--accent)',
    secondary: 'var(--accent-secondary)',
    glow: 'var(--accent-glow)',
    badge: 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30',
  };

  // 3D Tilt perspective on mouse move
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!coverRef.current || e.pointerType !== 'mouse') return;
    const rect = coverRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    coverRef.current.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translateZ(12px)`;
  };

  const handlePointerLeave = () => {
    if (!coverRef.current) return;
    coverRef.current.style.transform = 'perspective(1000px) rotateY(-6deg) rotateX(3deg) translateZ(0)';
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/[0.14] bg-[#070913] min-h-[30rem] sm:min-h-[34rem] lg:min-h-[38rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] group fade-in transition-all"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =========================================================================
          BACKGROUND: PURE LUXURY CYBER ARENA (NO STRETCHED / BLURRED GAME IMAGES)
          ========================================================================= */}
      {/* 1. Deep Celestial Starfield & Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, #0c1024 0%, #070913 70%, #030408 100%)',
        }}
      />

      {/* 2. Dynamic Theme-Reactive Ambient Stage Spotlights */}
      <div
        className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, ${genre.glow} 0%, transparent 65%)`,
          opacity: 0.35,
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[38rem] h-[38rem] rounded-full pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, ${genre.secondary}33 0%, transparent 65%)`,
          opacity: 0.3,
        }}
      />

      {/* 3. Subtle Cyber Geometry & Isometric Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 4. Luxury Top & Bottom Perimeter Edge Accents */}
      <div
        className="absolute top-0 left-12 right-12 h-[1.5px] pointer-events-none transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${genre.primary} 30%, ${genre.secondary} 70%, transparent 100%)`,
          opacity: 0.7,
        }}
      />

      {/* =========================================================================
          HERO MAIN CONTENT AREA: SPLIT STAGE (LEFT: HUD INFO, RIGHT: 3D CONSOLE)
          ========================================================================= */}
      <div className="relative z-30 h-full flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 p-5 sm:p-10 lg:p-16 pb-24 sm:pb-28">
        
        {/* LEFT COLUMN: HIGH-ENERGY ARCADE HUD INFORMATION */}
        <div className="flex-1 max-w-xl w-full space-y-4 sm:space-y-6 text-center lg:text-left z-20">
          
          {/* Header Badges Strip */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${genre.primary}, ${genre.secondary})`,
                color: '#070913',
                boxShadow: `0 0 16px ${genre.glow}`,
              }}
            >
              <Sparkles className="w-3 h-3 fill-current" />
              <span>Spotlight Pick 0{currentIndex + 1}/0{games.length}</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black border uppercase tracking-wider backdrop-blur-md ${genre.badge}`}>
              <Zap className="w-3 h-3" />
              <span>{current.category}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-white/[0.06] border border-white/15 text-amber-300 drop-shadow-sm backdrop-blur-md font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{current.rating_score.toFixed(1)}</span>
            </span>
          </div>

          {/* Giant, Crystal-Clear Game Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white font-display font-extrabold tracking-tight leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] line-clamp-2">
              {current.title}
            </h1>

            {/* Live Player Popularity Counter */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[11px] font-mono font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400">{(current.play_count || 12450).toLocaleString()} gamers playing</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> {current.supported_players}
              </span>
            </div>
          </div>

          {/* Short, Engaging Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0">
            {current.description}
          </p>

          {/* Action Call to Action Cluster */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <Link
              href={`/game/${current.slug}`}
              onClick={() => playSfx('launch')}
              className="btn-gaming flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 shadow-[0_10px_30px_-6px_var(--accent-glow)] hover:scale-105 active:scale-95"
              style={{
                boxShadow: `0 12px 32px -6px ${genre.glow}`,
              }}
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>PLAY NOW</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                playSfx('like');
                toggleFavorite(current.id);
              }}
              className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all duration-200 flex items-center gap-2 text-xs font-bold active:scale-95 shadow-md"
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''
                }`}
              />
              <span className="hidden sm:inline">{isFav ? 'Saved' : 'Favorite'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant • 100% Free • No Installs</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D HOLOGRAPHIC GAME SHOWCASE PEDESTAL */}
        <div className="w-full max-w-md lg:max-w-lg z-20 flex flex-col items-center">
          <Link
            href={`/game/${current.slug}`}
            onClick={() => playSfx('launch')}
            className="block w-full group/stage cursor-pointer"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <div
              ref={coverRef}
              className="relative rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-4 border border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out [transform:rotateY(-6deg)_rotateX(3deg)] group-hover/stage:border-white/40"
            >
              {/* Grand Behind Aura (Ambient stage lighting matching game) */}
              <div
                className="absolute -inset-4 rounded-[3rem] blur-[60px] opacity-40 transition-all duration-700 pointer-events-none group-hover/stage:opacity-75"
                style={{
                  background: `linear-gradient(135deg, ${genre.primary}, ${genre.secondary})`,
                }}
              />

              {/* The Crisp, Clean, 100% Uncropped Showcase Screen */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden bg-[#04060d] border border-white/10 flex items-center justify-center p-3 sm:p-4 shadow-2xl">
                {/* Tech Grid Floor under the Game Icon */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Whole Game Artwork - Crisp, Sharp, Beautiful, Uncropped */}
                <img
                  src={current.banner_url || current.thumbnail_url}
                  alt={current.title}
                  className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover/stage:scale-105"
                />

                {/* Floating Top-Rated Ribbon */}
                <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full shadow-[0_4px_16px_rgba(245,158,11,0.6)] flex items-center gap-1 border border-amber-300">
                  <Crown className="w-3.5 h-3.5 fill-black" />
                  <span>TOP RATED</span>
                </div>

                {/* Floating Category Tag */}
                <div className="absolute bottom-3 left-3 z-20 bg-black/80 backdrop-blur-md text-white font-mono font-bold text-[9px] sm:text-[10px] px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: genre.primary }} />
                  <span>{current.category.toUpperCase()}</span>
                </div>

                {/* Hover Quick-Launch Orb */}
                <div className="absolute inset-0 z-30 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover/stage:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-black font-black shadow-2xl transition-transform duration-300 scale-75 group-hover/stage:scale-100"
                    style={{
                      background: `linear-gradient(135deg, ${genre.primary}, ${genre.secondary})`,
                      boxShadow: `0 0 30px ${genre.glow}`,
                    }}
                  >
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
              </div>

              {/* Pedestal Reflection Base Line */}
              <div
                className="w-48 h-1 rounded-full mx-auto mt-2 blur-sm pointer-events-none transition-all duration-700"
                style={{ backgroundColor: genre.primary, opacity: 0.5 }}
              />
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM INTERACTIVE SPOTLIGHT CAROUSEL STRIP (MULTI-GAME SWITCHER)
          ========================================================================= */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-40 flex items-center justify-between gap-3">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous game"
          className="p-2.5 sm:p-3 rounded-xl bg-black/70 hover:bg-white/15 border border-white/15 text-white transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Thumbnail Selector Cards Strip (Directly Preview & Switch Games) */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none max-w-3xl mx-auto">
          {games.map((g, idx) => {
            const isActive = currentIndex === idx;
            const gGenre = GENRE_ACCENTS[g.category] || genre;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  playSfx('tap');
                  setCurrentIndex(idx);
                }}
                className={`group/thumb flex items-center gap-2 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all duration-300 text-left shrink-0 ${
                  isActive
                    ? 'bg-white/[0.12] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105'
                    : 'bg-black/50 border-white/10 hover:border-white/25 hover:bg-white/[0.05] opacity-65 hover:opacity-100'
                }`}
              >
                {/* Mini Image */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-black/80 border border-white/20 shrink-0 p-0.5">
                  <img
                    src={g.thumbnail_url}
                    alt={g.title}
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>

                {/* Title & Index (Desktop) */}
                <div className="hidden md:flex flex-col min-w-0 pr-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-extrabold text-white truncate max-w-[100px] leading-tight mt-0.5">
                    {g.title}
                  </span>
                </div>

                {/* Active Progress Line indicator */}
                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 hidden sm:block animate-pulse"
                    style={{ backgroundColor: gGenre.primary }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next game"
          className="p-2.5 sm:p-3 rounded-xl bg-black/70 hover:bg-white/15 border border-white/15 text-white transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
