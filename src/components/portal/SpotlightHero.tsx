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
  Heart,
} from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { playSfx } from '@/lib/sfx';

interface SpotlightHeroProps {
  games: GameManifest[];
}

export function SpotlightHero({ games }: SpotlightHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { favorites, toggleFavorite } = useAuth();
  const coverRef = useRef<HTMLDivElement>(null);

  // Auto-advance timer (7.5 seconds)
  useEffect(() => {
    if (games.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [games.length, paused]);

  if (!games || games.length === 0) return null;
  const current = games[currentIndex % games.length];
  const isFav = favorites.includes(current.id);

  const go = (dir: number) => {
    playSfx('tap');
    setCurrentIndex((prev) => (prev + dir + games.length) % games.length);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!coverRef.current || e.pointerType !== 'mouse') return;
    const rect = coverRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    coverRef.current.style.transform = `perspective(1000px) rotateY(${x * 16}deg) rotateX(${-y * 14}deg) translateZ(15px)`;
  };

  const handlePointerLeave = () => {
    if (!coverRef.current) return;
    coverRef.current.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(4deg) translateZ(0)';
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/[0.15] bg-[#06070b]/95 min-h-[26rem] sm:min-h-[32rem] lg:h-[38rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] group fade-in card-3d"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 10%, #0d1228 0%, #06070b 65%, #030408 100%)',
        }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 20% 20%, var(--accent) 0%, transparent 60%), radial-gradient(ellipse 65% 55% at 80% 80%, var(--accent-secondary) 0%, transparent 60%)',
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-10 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#06070b] via-[#06070b]/35 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#06070b]/80 via-transparent to-[#06070b]/60 pointer-events-none" />

      <div className="relative z-30 h-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 sm:gap-8 p-4 sm:p-10 lg:p-16">
        <div
          key={current.id}
          className="fade-up glass-panel rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 lg:p-10 max-w-xl w-full space-y-4 sm:space-y-5 border border-white/15 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] relative overflow-hidden"
        >
          {/* Subtle Ambient Light Sweep */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[var(--accent)] opacity-15 blur-2xl pointer-events-none" />

          {/* Badges Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-[#06070b] text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-[0_0_12px_var(--accent-glow)]">
              <Sparkles className="w-3 h-3 fill-current" /> Featured
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-white/[0.08] border border-white/15 text-[var(--accent)] drop-shadow-sm backdrop-blur-md">
              <Zap className="w-3 h-3" /> {current.category}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-white/[0.08] border border-white/15 text-slate-200 drop-shadow-sm backdrop-blur-md">
              <Gamepad2 className="w-3 h-3 text-[var(--accent-secondary)]" /> {current.supported_players}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-white/[0.08] border border-white/15 text-amber-300 drop-shadow-sm backdrop-blur-md font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{current.rating_score.toFixed(1)}</span>
            </span>
          </div>

          {/* Mobile Clean Uncropped Game Preview (Zero Blurs) */}
          <Link
            href={`/game/${current.slug}`}
            onClick={() => playSfx('launch')}
            className="block md:hidden w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-b from-[#0b0e1a] to-[#04060c] border border-white/15 active:border-[var(--accent)] relative p-2 shadow-lg cursor-pointer"
          >
            <img
              src={current.banner_url || current.thumbnail_url}
              alt={current.title}
              className="relative z-10 w-full h-full object-contain rounded-lg drop-shadow-md"
            />
          </Link>

          {/* Spotlight Index HUD */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[var(--accent)] uppercase">
              // SPOTLIGHT 0{currentIndex + 1} OF 0{games.length}
            </span>
          </div>

          {/* Giant Title */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl text-white font-display font-extrabold leading-[1.1] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] line-clamp-2">
            {current.title}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium">
            {current.description}
          </p>

          {/* Actions Cluster */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href={`/game/${current.slug}`}
              onClick={() => playSfx('launch')}
              data-sfx="launch"
              className="btn-gaming flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full font-black text-sm tracking-wider shadow-[0_12px_28px_-6px_var(--accent-glow)] w-full sm:w-auto text-center active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" /> Play Now
            </Link>

            <button
              type="button"
              onClick={() => {
                playSfx('like');
                toggleFavorite(current.id);
              }}
              className="p-3 sm:p-3.5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold active:scale-95 shadow-md"
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''
                }`}
              />
              <span className="sm:hidden">{isFav ? 'Saved' : 'Favorite'}</span>
            </button>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Instant • Free • No Download</span>
            </div>
          </div>
        </div>

        <div key={`${current.id}-art`} className="hidden md:block flex-1 max-w-md w-full fade-in">
          <Link
            href={`/game/${current.slug}`}
            onClick={() => playSfx('launch')}
            className="block group/cover cursor-pointer"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <div
              ref={coverRef}
              className="relative rounded-[2.25rem] p-2 border border-white/20 bg-[#0a0d1d]/85 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-300 ease-out [transform:rotateY(-8deg)_rotateX(4deg)] group-hover/cover:border-[var(--accent)] group-hover/cover:shadow-[0_0_35px_var(--accent-glow),0_30px_60px_-15px_rgba(0,0,0,0.95)]"
            >
              {/* Outer Neon Atmospheric Glow Aura */}
              <div className="absolute -inset-4 rounded-[2.5rem] blur-[50px] opacity-50 bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] pointer-events-none group-hover/cover:opacity-95 group-hover/cover:scale-105 transition-all duration-500" />

              {/* Inner Chassis Container */}
              <div className="relative w-full aspect-[4/3] rounded-[1.75rem] overflow-hidden bg-gradient-to-b from-[#0e1224] to-[#04060d] border border-white/10 group-hover/cover:border-[var(--accent)]/50 shadow-2xl flex items-center justify-center p-3 transition-colors duration-300">
                {/* Radial energy flare that blooms behind the game artwork on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent)_0%,transparent_70%)] opacity-20 group-hover/cover:opacity-60 transition-opacity duration-500 pointer-events-none" />

                {/* Prismatic Holographic Light Streak that sweeps across on hover */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div className="w-[180%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/cover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>

                {/* Game Cover Artwork: Stays 100% visible, bright, and scales smoothly without blackout */}
                <img
                  src={current.banner_url || current.thumbnail_url}
                  alt={current.title}
                  className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-[0_12px_32px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover/cover:scale-105"
                />

                {/* Cyber Corner HUD Accents */}
                <div className="absolute top-2.5 left-2.5 z-20 w-3 h-3 border-t-2 border-l-2 border-white/30 group-hover/cover:border-[var(--accent)] transition-colors pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 z-20 w-3 h-3 border-b-2 border-r-2 border-white/30 group-hover/cover:border-[var(--accent)] transition-colors pointer-events-none" />

                {/* Center Floating Radiant Play Orb with Pulse & Pill Badge (Zero blackout!) */}
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-2 opacity-0 scale-75 group-hover/cover:opacity-100 group-hover/cover:scale-100 transition-all duration-300 ease-out">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-2.5 rounded-full bg-[var(--accent)] opacity-60 blur-md animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] text-black flex items-center justify-center shadow-[0_0_30px_var(--accent-glow)] border-2 border-white/90">
                        <Play className="w-7 h-7 fill-black ml-1 drop-shadow" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/85 border border-[var(--accent)]/60 text-[var(--accent)] text-[10px] font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                      <span>Play Now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top-Right Glowing Crown Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-full px-3.5 py-1.5 text-[11px] font-black shadow-[0_6px_20px_rgba(245,158,11,0.5)] flex items-center gap-1.5 border border-amber-300/60 lift-z-2">
                <Crown className="w-3.5 h-3.5 fill-black" /> TOP RATED
              </div>
            </div>
          </Link>
        </div>
      </div>

      {games.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous game"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[var(--accent)] hover:text-black hover:border-transparent transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next game"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-[var(--accent)] hover:text-black hover:border-transparent transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
        {games.map((g, idx) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              playSfx('tap');
              setCurrentIndex(idx);
            }}
            aria-label={`Show ${g.title}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-8 bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
