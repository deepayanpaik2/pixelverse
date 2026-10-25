'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Heart, Star, Sparkles } from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { NEW_GAME_IDS } from '@/lib/games';
import { getOutlineTheme, GameIconOutline } from './GameIconOutline';

interface GameTileProps {
  game: GameManifest;
  size?: '1x1' | '2x2' | 'wide';
  priority?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<GameTileProps['size']>, string> = {
  '1x1': 'col-span-1',
  wide: 'col-span-2',
  '2x2': 'col-span-2 row-span-2',
};

function GameTileBase({ game, size = '1x1', priority = false }: GameTileProps) {
  const { favorites, toggleFavorite } = useAuth();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const isFav = favorites.includes(game.id);
  const isNew = NEW_GAME_IDS.has(game.id);
  const hasRating = game.likes_count + game.dislikes_count > 0;
  const big = size !== '1x1';

  // Deterministic creative outline theme unique to this game
  const outlineTheme = getOutlineTheme(game.id, game.category);

  const onTilt = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-(py - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const onTiltEnd = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <Link
      href={`/game/${game.slug}`}
      title={game.title}
      onPointerMove={onTilt}
      onPointerLeave={onTiltEnd}
      className={`game-tile group relative rounded-[1.4rem] p-2 bg-[#090b14]/90 border border-white/[0.12] ${outlineTheme.tileHoverBorder} transition-all flex flex-col justify-between ${SIZE_CLASSES[size]}`}
    >
      {/* 3D Depth Reactive Ambient Glow customized per game outline theme */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className="absolute -inset-2 rounded-[1.6rem] blur-2xl opacity-40 transition-all duration-300"
          style={{
            background: `radial-gradient(circle, ${outlineTheme.accentGlow} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Upper Image Frame (100% Whole Uncropped Artwork with Creative Outline Frame) */}
      <div
        className={`relative w-full rounded-[1.1rem] overflow-hidden bg-[#060812] border ${outlineTheme.borderClass} ${outlineTheme.hoverBorderClass} ${outlineTheme.glowShadowClass} transition-all duration-300 shrink-0 flex items-center justify-center ${
          size === 'wide'
            ? 'aspect-[16/7]'
            : size === '2x2'
            ? 'aspect-[4/3] sm:aspect-[16/10]'
            : 'aspect-[4/3]'
        }`}
      >
        {/* Creative Outline Frame with Micro-Corner Ornaments and Edge Accents */}
        <GameIconOutline theme={outlineTheme} />

        {!loaded && !broken && <div className="absolute inset-0 tile-skeleton z-10" />}

        {broken ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40">
            <span className="font-display text-4xl font-black text-white/70 drop-shadow-lg">{game.title.charAt(0)}</span>
          </div>
        ) : (
          <>
            {/* Ambient artwork backdrop softly filling the frame */}
            <img
              src={game.thumbnail_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-125 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-[#060812]/50 pointer-events-none" />

            {/* Whole, 100% Uncropped, Perfectly Fitted Game Photo */}
            <img
              ref={imgRef}
              src={game.thumbnail_url}
              width={big ? 520 : 260}
              height={big ? 390 : 195}
              sizes={
                big
                  ? '(min-width: 640px) 42vw, 100vw'
                  : '(min-width: 1536px) 14vw, (min-width: 1024px) 18vw, (min-width: 640px) 24vw, 48vw'
              }
              alt={game.title}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setBroken(true)}
              className={`relative z-10 w-full h-full object-contain p-2 rounded-xl transition-transform duration-300 ease-out group-hover:scale-105 drop-shadow-md ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {/* Subtle top/bottom sheen */}
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />

        {/* Top Badges Strip inside Image Frame */}
        <div className="tile-badge absolute top-2.5 left-2.5 right-2.5 z-30 flex items-start justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1 min-w-0">
            {isNew && (
              <span
                className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black text-black shadow-md"
                style={{
                  background: `linear-gradient(to right, #ffffff, ${outlineTheme.accentHex})`,
                  boxShadow: `0 0 10px ${outlineTheme.accentGlow}`,
                }}
              >
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
          </div>

          {/* Favorite Tactile Button */}
          <button
            onClick={handleFavoriteClick}
            data-sfx="like"
            className="shrink-0 pointer-events-auto p-1.5 rounded-full bg-black/70 border border-white/20 text-slate-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 hover:border-rose-400/50 hover:scale-115 active:scale-90 transition-all duration-200 drop-shadow-lg backdrop-blur-md"
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]' : ''}`} />
          </button>
        </div>

        {/* Center Floating 3D Play Orb on Hover colored to match Outline Theme */}
        <div className="tile-play-orb absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl text-black font-black"
            style={{
              backgroundColor: outlineTheme.accentHex,
              boxShadow: `0 0 24px ${outlineTheme.accentGlow}`,
            }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Clean Info Area UNDER the Image (Zero artwork obstruction!) */}
      <div className="w-full px-1.5 pt-2.5 pb-1 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <h3
            className={`font-display font-extrabold text-white truncate group-hover:text-white transition-colors leading-tight ${
              big ? 'text-base sm:text-lg' : 'text-xs sm:text-[13px]'
            }`}
          >
            {game.title}
          </h3>
          {hasRating && (
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-black shrink-0 tabular-nums">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{game.rating_score}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
          <span
            className="truncate font-semibold tracking-wide text-[10.5px]"
            style={{ color: outlineTheme.accentHex }}
          >
            {game.category}
          </span>
          <span className="shrink-0 text-slate-500 font-mono text-[9px] uppercase tracking-wide">
            {game.supported_players}
          </span>
        </div>

        {size === '2x2' && game.description && (
          <p className="text-[11px] text-slate-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {game.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export const GameTile = memo(GameTileBase);
