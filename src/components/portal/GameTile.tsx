'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Sparkles } from 'lucide-react';
import { GameManifest } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { NEW_GAME_IDS } from '@/lib/games';

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <Link
      href={`/game/${game.slug}`}
      title={game.title}
      className={`group relative rounded-2xl p-2 bg-[#0a0e1c]/80 hover:bg-[#10172e] border border-white/[0.08] hover:border-[var(--accent)]/50 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.85)] hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${SIZE_CLASSES[size]}`}
    >
      {/* Artwork Frame */}
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-[#05070f] border border-white/[0.06] transition-all duration-300 shrink-0 flex items-center justify-center ${
          size === 'wide'
            ? 'aspect-[16/7]'
            : size === '2x2'
            ? 'aspect-[4/3] sm:aspect-[16/10]'
            : 'aspect-[4/3]'
        }`}
      >
        {!loaded && !broken && <div className="absolute inset-0 tile-skeleton z-10" />}

        {broken ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40">
            <span className="font-display text-4xl font-black text-white/70 drop-shadow-lg">
              {game.title.charAt(0)}
            </span>
          </div>
        ) : (
          <>
            {/* Ambient subtle backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            {/* Whole Uncropped Crisp Artwork */}
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
              className={`relative z-10 w-full h-full object-contain p-1.5 rounded-lg transition-transform duration-300 ease-out group-hover:scale-105 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {/* Subtle sheen */}
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity pointer-events-none" />

        {/* Top Badges & Favorite Heart */}
        <div className="absolute top-2 left-2 right-2 z-20 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex items-center gap-1 min-w-0">
            {isNew && (
              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-[var(--accent)] text-[#05070f] shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
          </div>

          {/* Tactile Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            data-sfx="like"
            className="shrink-0 pointer-events-auto p-1.5 rounded-full bg-black/60 border border-white/15 text-slate-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 hover:border-rose-400/50 hover:scale-110 active:scale-90 transition-all duration-200 shadow-md backdrop-blur-sm"
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFav ? 'fill-rose-400 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Area Beneath Artwork */}
      <div className="w-full px-1 pt-2 pb-0.5 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <h3
            className={`font-display font-extrabold text-white truncate group-hover:text-[var(--accent)] transition-colors leading-tight ${
              big ? 'text-sm sm:text-base' : 'text-xs sm:text-[13px]'
            }`}
          >
            {game.title}
          </h3>
          {hasRating && (
            <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-amber-300 font-bold shrink-0 tabular-nums">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{game.rating_score.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1 gap-1 min-w-0">
          <span className="truncate text-slate-400 group-hover:text-slate-300 transition-colors">
            {game.category}
          </span>
          <span className="shrink-0 text-slate-500 font-mono text-[9px] uppercase">
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
