'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Dices, X, Star, ArrowRight, RotateCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameManifest } from '@/types';
import { getRandomGamePool } from '@/lib/games';
import { playSfx } from '@/lib/sfx';

interface GameRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameRouletteModal({ isOpen, onClose }: GameRouletteModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [candidates, setCandidates] = useState<GameManifest[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<GameManifest | null>(null);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startSpin = () => {
    const pool = getRandomGamePool(16);
    setCandidates(pool);
    setIsSpinning(true);
    setWinner(null);
    playSfx('roulette');

    let currentIdx = 0;
    let speed = 40; // ms per tick
    let elapsed = 0;
    const totalSpinTime = 1400; // ms

    const tick = () => {
      currentIdx = (currentIdx + 1) % pool.length;
      setActiveIndex(currentIdx);
      elapsed += speed;

      if (elapsed > totalSpinTime * 0.6) {
        speed += 22;
      }

      if (elapsed < totalSpinTime) {
        spinTimerRef.current = setTimeout(tick, speed);
      } else {
        const winningGame = pool[currentIdx];
        setWinner(winningGame);
        setIsSpinning(false);
        playSfx('like');

        try {
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.55 },
            colors: ['#00f3ff', '#ff007f', '#ffd700', '#ffffff', '#a855f7'],
            disableForReducedMotion: true,
          });
        } catch {}
      }
    };

    spinTimerRef.current = setTimeout(tick, speed);
  };

  useEffect(() => {
    if (isOpen) {
      startSpin();
    } else {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      setWinner(null);
      setIsSpinning(false);
    }
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, [isOpen]);

  // Esc key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSpinning) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSpinning, onClose]);

  if (!isOpen || !mounted) return null;

  const displayGame = winner || candidates[activeIndex] || null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      style={{ opacity: 1, pointerEvents: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md my-auto drawer-neon rounded-2xl sm:rounded-3xl border-2 border-[var(--accent)]/50 p-4 sm:p-5 shadow-[0_25px_60px_-15px_var(--accent-glow)] overflow-hidden text-center flex flex-col items-center gap-3 sm:gap-3.5 max-h-[min(90dvh,540px)]"
        style={{ opacity: 1, pointerEvents: 'auto' }}
      >
        {/* Top Radial Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[var(--accent)] opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-pink-500 opacity-20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all disabled:opacity-30 z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] sm:text-xs font-black tracking-wider uppercase shrink-0">
          <Dices className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Rolling the Arcade Dice...' : 'Jackpot Pick Found!'}</span>
        </div>

        {/* Roulette Stage / Card */}
        {displayGame ? (
          <div className="w-full flex flex-col items-center gap-2.5">
            {/* Compact Thumbnail Viewport - fits 100% without overflowing */}
            <div
              className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-black/80 border-2 transition-all duration-150 p-1.5 flex items-center justify-center shrink-0 ${
                isSpinning
                  ? 'border-[var(--accent)] scale-95 shadow-[0_0_20px_var(--accent-glow)]'
                  : 'border-white/30 scale-100 shadow-[0_0_25px_rgba(0,243,255,0.4)]'
              }`}
            >
              <img
                src={displayGame.thumbnail_url}
                alt={displayGame.title}
                className="w-full h-full object-contain rounded-xl drop-shadow-md"
              />

              {isSpinning && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] font-mono animate-pulse">
                    SHUFFLING
                  </span>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="space-y-0.5 max-w-xs">
              <h3 className="text-base sm:text-lg font-display font-extrabold text-white truncate">
                {displayGame.title}
              </h3>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[var(--accent)] font-bold text-[10px]">
                  {displayGame.category}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-mono font-bold text-[10px] sm:text-[11px]">
                  <Star className="w-3 h-3 fill-current" />
                  {displayGame.rating_score.toFixed(1)}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {displayGame.supported_players}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="w-full pt-1 flex flex-col gap-2 shrink-0">
          {winner ? (
            <>
              <button
                onClick={() => {
                  playSfx('launch');
                  onClose();
                  router.push(`/game/${winner.slug}`);
                }}
                className="btn-gaming w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_var(--accent-glow)] active:scale-95 transition-all"
              >
                <span>Play {winner.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={startSpin}
                className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin Again (Reroll)</span>
              </button>
            </>
          ) : (
            <div className="py-2 text-xs text-slate-400 font-medium animate-pulse flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Scanning 14,000+ games for top-tier action...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
