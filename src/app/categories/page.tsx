'use client';

import React from 'react';
import Link from 'next/link';
import {
  Grid, Gamepad2, Flame, Sparkles, Trophy, Zap, Users, Compass, Shield, Crosshair, Smile, Coffee,
  Globe, ChevronsUp, MousePointer, Puzzle, Car, Heart, MousePointerClick, Swords, Rocket, Goal, Box, ChefHat,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '@/lib/games';
import { playSfx } from '@/lib/sfx';

const ICON_MAP: Record<string, any> = {
  Flame,
  Compass,
  Gamepad2,
  Sparkles,
  Zap,
  Trophy,
  Shield,
  Crosshair,
  Users,
  Smile,
  Coffee,
  Globe,
  ChevronsUp,
  MousePointer,
  Grid,
  Puzzle,
  Car,
  Heart,
  MousePointerClick,
  Swords,
  Rocket,
  Goal,
  Box,
  ChefHat,
};

export default function CategoriesPage() {
  const totalGames = CATEGORIES.reduce((acc, c) => acc + c.game_count, 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-[#0a0e1c]/85 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 bg-white/[0.04] border border-white/10 shadow-inner">
            <Grid className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // Genre Catalog
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              All Game Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Browse the catalog across {CATEGORIES.length} game categories.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-[var(--accent)] bg-white/[0.04] border border-white/10 self-start md:self-auto tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          {totalGames.toLocaleString()} Games Indexed
        </span>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon_name] || Gamepad2;

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={() => playSfx('tap')}
              className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-[#0a0e1c]/80 hover:bg-[#10172e] border border-white/[0.08] hover:border-[var(--accent)]/50 transition-all duration-300 shadow-lg hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8)] hover:-translate-y-1 flex items-start gap-4"
            >
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200"
                style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color }}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-white group-hover:text-[var(--accent)] transition-colors truncate">
                    {cat.name}
                  </h2>
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 shrink-0 tabular-nums">
                    {cat.game_count.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 font-normal leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Browse {cat.name}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
