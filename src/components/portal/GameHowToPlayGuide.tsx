'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Monitor, 
  Smartphone, 
  Keyboard, 
  MousePointer, 
  RotateCw, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { GameManifest } from '@/types';

interface GameHowToPlayGuideProps {
  game: GameManifest;
  variant?: 'full' | 'compact' | 'modal';
}

interface ControlItem {
  keys?: string[];
  gesture?: string;
  action: string;
}

interface GameGuideData {
  goal: string;
  recommendedOrientation: 'landscape' | 'portrait';
  pcControls: ControlItem[];
  mobileControls: ControlItem[];
  quickRule: string;
}

export function getGameGuide(game: GameManifest): GameGuideData {
  const cat = (game.category || '').toLowerCase();
  const title = (game.title || '').toLowerCase();
  const isPortraitDefault = game.orientation === 'portrait';

  // 1. Racing / Driving / Car / Drifting / Parking / Bikes
  if (cat.includes('rac') || cat.includes('car') || cat.includes('drive') || title.includes('drift') || title.includes('moto') || title.includes('park')) {
    return {
      goal: 'Outspeed rivals, avoid crashes, and cross the finish line in first place.',
      recommendedOrientation: 'landscape',
      pcControls: [
        { keys: ['W', '▲'], action: 'Accelerate / Gas' },
        { keys: ['S', '▼'], action: 'Brake / Reverse' },
        { keys: ['A', 'D', '◄', '►'], action: 'Steer Left & Right' },
        { keys: ['Space'], action: 'Handbrake / Drift' },
      ],
      mobileControls: [
        { gesture: 'Touch Left / Right', action: 'Steer vehicle' },
        { gesture: 'Touch Pedals', action: 'Gas & Brake' },
        { gesture: 'Tap Nitro Icon', action: 'Speed boost' },
      ],
      quickRule: 'Tap brake before sharp turns to initiate a controlled drift boost.',
    };
  }

  // 2. Shooter / FPS / Zombie / Action / Guns / Sniper / Tanks / War
  if (cat.includes('shoot') || cat.includes('action') || cat.includes('zombie') || cat.includes('tank') || title.includes('sniper') || title.includes('gun')) {
    return {
      goal: 'Aim accurately, defeat incoming hostile enemies, and survive all waves.',
      recommendedOrientation: 'landscape',
      pcControls: [
        { keys: ['W', 'A', 'S', 'D'], action: 'Move player' },
        { keys: ['Mouse'], action: 'Aim crosshair' },
        { keys: ['Left Click'], action: 'Fire weapon' },
        { keys: ['Space', 'R'], action: 'Jump / Reload' },
      ],
      mobileControls: [
        { gesture: 'Left Screen Drag', action: 'Move character' },
        { gesture: 'Right Screen Drag', action: 'Aim crosshair' },
        { gesture: 'Tap Shoot Button', action: 'Fire weapon' },
      ],
      quickRule: 'Keep moving diagonally while firing to evade enemy projectiles.',
    };
  }

  // 3. Runner / Platformer / Jump / Subway / Endless / Parkour
  if (cat.includes('run') || cat.includes('platform') || title.includes('jump') || title.includes('subway') || title.includes('dash')) {
    return {
      goal: 'Dodge obstacles, jump across gaps, and sprint as far as possible.',
      recommendedOrientation: isPortraitDefault ? 'portrait' : 'landscape',
      pcControls: [
        { keys: ['▲', 'Space'], action: 'Jump over obstacles' },
        { keys: ['▼', 'S'], action: 'Slide under barriers' },
        { keys: ['◄', '►', 'A', 'D'], action: 'Switch lanes left / right' },
      ],
      mobileControls: [
        { gesture: 'Swipe Up', action: 'Jump' },
        { gesture: 'Swipe Down', action: 'Slide under barriers' },
        { gesture: 'Swipe Left / Right', action: 'Switch lanes' },
      ],
      quickRule: 'Watch two obstacles ahead so you time your moves before panic sets in.',
    };
  }

  // 4. Puzzle / Match-3 / Mahjong / Connect / 2048 / Brain / Jewel / Blocks
  if (cat.includes('puzzle') || cat.includes('match') || cat.includes('mahjong') || cat.includes('brain') || cat.includes('2048') || cat.includes('block')) {
    return {
      goal: 'Match matching pieces, trigger cascading combos, and clear the board.',
      recommendedOrientation: isPortraitDefault ? 'portrait' : 'landscape',
      pcControls: [
        { keys: ['Left Click'], action: 'Select tile or gem' },
        { keys: ['Mouse Drag'], action: 'Swap adjacent pieces' },
      ],
      mobileControls: [
        { gesture: 'Tap', action: 'Select tile' },
        { gesture: 'Drag & Release', action: 'Swap or connect pieces' },
      ],
      quickRule: 'Match from the bottom row to trigger free automatic combo cascades.',
    };
  }

  // 5. Sports / Soccer / Basketball / Football / Tennis / Golf / Pool / Cricket
  if (cat.includes('sport') || cat.includes('soccer') || cat.includes('basket') || cat.includes('tennis') || cat.includes('golf') || cat.includes('pool')) {
    return {
      goal: 'Score points, outplay the opponent team, and defend your goal.',
      recommendedOrientation: 'landscape',
      pcControls: [
        { keys: ['Arrows', 'W,A,S,D'], action: 'Move player' },
        { keys: ['Space', 'Click'], action: 'Pass & Shoot (Hold for power)' },
      ],
      mobileControls: [
        { gesture: 'Drag & Flick', action: 'Aim ball trajectory & power' },
        { gesture: 'Tap Teammate', action: 'Direct pass / tackle' },
      ],
      quickRule: 'Hold shot meter to roughly 85% for maximum trajectory accuracy.',
    };
  }

  // 6. IO / Multiplayer / Snake / Battle Royale
  if (cat.includes('io') || cat.includes('multiplayer') || title.includes('snake') || title.includes('worm')) {
    return {
      goal: 'Collect food and orbs to grow bigger, outmaneuver rivals, and dominate the lobby.',
      recommendedOrientation: 'landscape',
      pcControls: [
        { keys: ['Mouse Move', 'Arrows'], action: 'Steer snake / avatar' },
        { keys: ['Left Click', 'Space'], action: 'Speed burst boost' },
      ],
      mobileControls: [
        { gesture: 'Drag Finger', action: 'Steer direction' },
        { gesture: 'Double Tap & Hold', action: 'Speed burst boost' },
      ],
      quickRule: 'Conserve your speed boost; only sprint when securing a kill or escaping.',
    };
  }

  // 7. General Arcade / Casual / Default
  return {
    goal: 'Master the game mechanics, dodge hazards, and score maximum points.',
    recommendedOrientation: isPortraitDefault ? 'portrait' : 'landscape',
    pcControls: [
      { keys: ['Arrows', 'W,A,S,D'], action: 'Move / Steer' },
      { keys: ['Space', 'Left Click'], action: 'Primary action / Jump' },
    ],
    mobileControls: [
      { gesture: 'Swipe / Drag', action: 'Move / Steer' },
      { gesture: 'Tap Screen', action: 'Action / Jump' },
    ],
    quickRule: 'Stay near the screen center to give yourself maximum reaction time.',
  };
}

export function GameHowToPlayGuide({ game, variant = 'full' }: GameHowToPlayGuideProps) {
  const guide = getGameGuide(game);
  const [activeTab, setActiveTab] = useState<'both' | 'pc' | 'mobile'>(variant === 'compact' ? 'both' : 'both');

  // Compact variant for duel modal & party room overlays
  if (variant === 'compact' || variant === 'modal') {
    return (
      <div className="w-full rounded-2xl bg-[#090d1a] border border-white/10 p-3.5 space-y-2.5 text-left text-xs shadow-inner">
        {/* Header with goal */}
        <div className="flex items-start gap-2 min-w-0">
          <Target className="w-4 h-4 text-arcade-champagne shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-arcade-champagne block">
              Objective
            </span>
            <p className="text-white font-medium text-xs leading-snug line-clamp-2">
              {guide.goal}
            </p>
          </div>
        </div>

        {/* 2-Col Quick Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
          {/* PC Quick Controls */}
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>PC Controls</span>
            </div>
            <div className="space-y-1">
              {guide.pcControls.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] gap-2">
                  <div className="flex items-center gap-1 shrink-0">
                    {c.keys?.map((k, ki) => (
                      <kbd key={ki} className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-[10px] font-mono font-bold text-white shadow-sm">
                        {k}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-slate-300 truncate text-right font-medium">{c.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Quick Controls */}
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Controls</span>
              <span className="text-[9px] font-mono text-slate-400 ml-auto uppercase font-bold">
                {guide.recommendedOrientation === 'portrait' ? '📱 Portrait' : '🔄 Landscape'}
              </span>
            </div>
            <div className="space-y-1">
              {guide.mobileControls.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shrink-0">
                    {c.gesture}
                  </span>
                  <span className="text-slate-300 truncate text-right font-medium">{c.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant for game detail page
  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-arcade-border space-y-5 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Goal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white">
              How to Play {game.title}
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 pl-0.5">
            <Target className="w-3.5 h-3.5 text-arcade-champagne shrink-0" />
            <span className="text-arcade-champagne font-bold">Objective:</span> {guide.goal}
          </p>
        </div>

        {/* Orientation badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300">
            <RotateCw className="w-3 h-3 text-[var(--accent)]" />
            <span>Mobile Best in:</span>
            <strong className="text-white capitalize">{guide.recommendedOrientation}</strong>
          </span>
        </div>
      </div>

      {/* Dual Controls Grid (PC & Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC Controls Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 shadow-inner hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">PC Controls</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              Keyboard & Mouse
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {guide.pcControls.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 gap-3">
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {c.keys?.map((k, ki) => (
                    <kbd 
                      key={ki} 
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-white/20 text-xs font-mono font-black text-white shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-xs text-slate-200 font-semibold text-right">{c.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Controls Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 shadow-inner hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">Mobile Controls</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Touch & Gestures
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {guide.mobileControls.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 shrink-0">
                  {c.gesture}
                </span>
                <span className="text-xs text-slate-200 font-semibold text-right">{c.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Core Rule Pill */}
      {guide.quickRule && (
        <div className="p-3 rounded-xl bg-arcade-champagne/10 border border-arcade-champagne/25 flex items-center gap-2 text-xs text-slate-200">
          <Sparkles className="w-4 h-4 text-arcade-champagne shrink-0" />
          <p className="font-medium">
            <strong className="text-white font-bold">Winning Tip:</strong> {guide.quickRule}
          </p>
        </div>
      )}
    </div>
  );
}
