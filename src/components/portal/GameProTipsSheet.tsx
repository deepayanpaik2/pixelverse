'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Keyboard, 
  Smartphone, 
  ThumbsUp, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Gamepad2,
  Check
} from 'lucide-react';
import { GameManifest } from '@/types';
import { playSfx } from '@/lib/sfx';

interface GameProTipsSheetProps {
  game: GameManifest;
}

interface CommunityTip {
  id: string;
  author: string;
  text: string;
  votes: number;
  hasVoted?: boolean;
}

// Generate smart genre-tailored pro tactics
function getCategoryTactics(category: string, title: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes('io') || cat.includes('multiplayer')) {
    return [
      'Early-Game Safety: Stick to outer perimeters to farm mass or points safely before challenging apex players.',
      'Boost Conservation: Sprinting usually consumes your score/mass — only burst when securing a guaranteed kill or escaping.',
      'Trap Mechanics: Force opponents toward boundary walls where their turning radius is severely limited.',
    ];
  }
  if (cat.includes('rac') || cat.includes('car') || cat.includes('drive')) {
    return [
      'Apex Cornering: Tap the brake or handbrake just before entering sharp turns to initiate a controlled drift.',
      'Slipstream Boost: Trail closely behind rival cars on straightaways to draft and slingshot past them.',
      'Recovery Reset: If you spin out, release acceleration for half a second to realign before gunning the throttle.',
    ];
  }
  if (cat.includes('shoot') || cat.includes('action') || cat.includes('zombie')) {
    return [
      'Circle Strafing: Always move perpendicular or diagonally to enemies while maintaining crosshair lock.',
      'Target Priority: Eliminate fast/explosive minions first to prevent being swarmed in tight choke points.',
      'Reload Discipline: Reload behind cover immediately after each skirmish — never run dry during combat.',
    ];
  }
  if (cat.includes('puzzle') || cat.includes('match') || cat.includes('brain')) {
    return [
      'Bottom-Up Strategy: Clear bottom rows first to cause cascading gravity falls that score free automatic matches.',
      'Powerup Combinations: Avoid detonating special gems immediately; combine two adjacent powerups for board wipeouts.',
      'Timer Management: Scan for horizontal 4-matches first, which clear tough obstacles much faster.',
    ];
  }
  if (cat.includes('sport') || cat.includes('soccer')) {
    return [
      'Shot Meter Apex: Release your kick/throw right as the gauge hits 85-90% for maximum accuracy and curve.',
      'Defensive Positioning: Guard passing lanes rather than lunging into aggressive slide tackles.',
    ];
  }
  return [
    `Rhythm Timing: In ${title}, finding a consistent tapping tempo prevents panic inputs during speed spikes.`,
    'Visual Cue Focus: Keep your eyes focused slightly ahead of your character rather than directly on them.',
    'Bonus Hunter: Prioritize golden pickups and multipliers early to balloon your final arcade score.',
  ];
}

export function GameProTipsSheet({ game }: GameProTipsSheetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [newTipText, setNewTipText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const storageKey = `pv-protips-${game.id}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTips(JSON.parse(stored));
      } else {
        const defaults: CommunityTip[] = getCategoryTactics(game.category, game.title).map((text, i) => ({
          id: `default-${i}`,
          author: i === 0 ? 'Arcade Master' : i === 1 ? 'Speedrunner' : 'Pro Gamer',
          text,
          votes: 18 - i * 4,
          hasVoted: false,
        }));
        setTips(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
    } catch {
      // fallback
    }
  }, [game.id, game.category, game.title]);

  const handleVote = (id: string) => {
    setTips((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const delta = t.hasVoted ? -1 : 1;
          return { ...t, votes: t.votes + delta, hasVoted: !t.hasVoted };
        }
        return t;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    playSfx('like');
  };

  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;
    setIsSubmitting(true);

    const newTip: CommunityTip = {
      id: `user-${Date.now()}`,
      author: 'You (Gamer)',
      text: newTipText.trim(),
      votes: 1,
      hasVoted: true,
    };

    const updated = [newTip, ...tips];
    setTips(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    setNewTipText('');
    setIsSubmitting(false);
    setAddedSuccess(true);
    playSfx('launch');
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Determine keycaps based on orientation and category
  const isRacing = /rac|car|drive|kart/i.test(game.category);
  const isShooter = /shoot|gun|action|zombie/i.test(game.category);
  const isPuzzle = /puzzle|match|brain|card|board/i.test(game.category);

  return (
    <div className="drawer-neon rounded-2xl border border-white/15 overflow-hidden shadow-xl transition-all">
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          playSfx('tap');
        }}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Lightbulb className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                💡 Pro Tips & Controls Cheat Sheet
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-[var(--accent)] font-mono">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Master the mechanics, keyboard keybinds, and secret tactics for {game.title}
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 sm:p-6 pt-0 space-y-6 border-t border-white/10">
          {/* Visual 3D Controls Cheat Sheet */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
              <Keyboard className="w-4 h-4 text-[var(--accent)]" />
              <span>Interactive Keybinds & Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Movement Keycaps */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Movement / Steering</div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="px-2 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">W</span>
                    <span className="px-2 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">A</span>
                    <span className="px-2 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">S</span>
                    <span className="px-2 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">D</span>
                  </div>
                  <span className="text-[11px] text-slate-400">or</span>
                  <span className="px-2 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">↑ ← ↓ →</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {isRacing ? 'Steer, accelerate & reverse' : 'Run, climb & dodge obstacles'}
                </p>
              </div>

              {/* Action / Jump Keycaps */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Action / Trigger</div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-lg bg-[#0e1322] border border-[var(--accent)]/40 text-xs font-black text-[var(--accent)] shadow-[0_3px_0_#050812]">
                    SPACE
                  </span>
                  {isShooter && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-white shadow-[0_3px_0_#050812]">
                      R
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  {isRacing ? 'Handbrake drift & boost' : isShooter ? 'Jump / Reload weapon' : 'Jump, attack & confirm'}
                </p>
              </div>

              {/* Mouse & Touch Screen Controls */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 sm:col-span-2 lg:col-span-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Mouse / Touch (Mobile)</div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e1322] border border-white/20 text-xs font-black text-slate-200 shadow-[0_3px_0_#050812] flex items-center gap-1">
                    <span>🖱️ Click & Drag</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e1322] border border-emerald-500/40 text-xs font-black text-emerald-300 shadow-[0_3px_0_#050812] flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>Tap / Swipe</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {isPuzzle ? 'Select tiles & drag connections' : 'Aim crosshair, click to shoot & full touch support on phones'}
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tactics & Community Tips List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Pro Gamer Tactics & Secrets ({tips.length})</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                        @{tip.author}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-[10px] text-slate-400">Pro Tip</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {tip.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVote(tip.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      tip.hasVoted
                        ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]'
                        : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
                    }`}
                    title="Upvote this pro tip"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${tip.hasVoted ? 'fill-current' : ''}`} />
                    <span className="font-mono text-xs">{tip.votes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add a Pro Tip Form */}
          <form onSubmit={handleAddTip} className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder={`Share your secret pro tip for ${game.title}...`}
              value={newTipText}
              onChange={(e) => setNewTipText(e.target.value)}
              className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent)] transition-all"
            />
            <button
              type="submit"
              disabled={!newTipText.trim() || isSubmitting}
              className="btn-gaming px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Posted!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tip</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
