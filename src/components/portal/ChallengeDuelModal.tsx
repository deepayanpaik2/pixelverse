'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, Check, Copy, Share2, MessageCircle, X, Shield, ArrowRight } from 'lucide-react';
import { GameManifest } from '@/types';
import { playSfx } from '@/lib/sfx';

interface ChallengeDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameManifest;
  roomCode: string;
  duelUrl: string;
  challengeText: string;
}

export function ChallengeDuelModal({
  isOpen,
  onClose,
  game,
  roomCode,
  duelUrl,
  challengeText,
}: ChallengeDuelModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(challengeText);
      setCopied(true);
      playSfx('tap');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `1v1 Duel in ${game.title}!`,
          text: challengeText,
          url: duelUrl,
        });
        playSfx('like');
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(challengeText)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      style={{ opacity: 1, pointerEvents: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md drawer-neon rounded-3xl border-2 border-rose-500/50 p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.4)] overflow-hidden text-center flex flex-col items-center gap-4"
        style={{ opacity: 1, pointerEvents: 'auto' }}
      >
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-rose-500 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-orange-500 opacity-20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black tracking-wider uppercase">
          <Swords className="w-4 h-4 text-rose-400" />
          <span>1v1 Duel Challenge Ready!</span>
        </div>

        {/* Game Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 w-full text-left">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/15 p-1 shrink-0 flex items-center justify-center">
            <img src={game.thumbnail_url} alt="" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm text-white truncate">{game.title}</h4>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="text-rose-400 font-mono font-bold">Room Code: {roomCode}</span>
              <span>•</span>
              <span>{game.category}</span>
            </div>
          </div>
        </div>

        {/* Invitation Text Box */}
        <div className="w-full bg-[#060810] border border-white/15 rounded-2xl p-3 text-left space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
            <span>Invite Message</span>
            {copied && <span className="text-emerald-400 font-bold">Copied!</span>}
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed select-all break-all line-clamp-3">
            {challengeText}
          </p>
        </div>

        {/* Sharing Action Grid */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs font-bold">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx('tap')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 hover:text-white transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[var(--accent)]" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>

        {/* Primary CTA: Jump into the battle arena */}
        <button
          onClick={() => {
            playSfx('launch');
            onClose();
            router.push(`/rooms/${roomCode}?duel=1`);
          }}
          className="btn-gaming w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(244,63,94,0.4)]"
        >
          <Swords className="w-4 h-4 fill-current" />
          <span>Enter Battle Room Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
