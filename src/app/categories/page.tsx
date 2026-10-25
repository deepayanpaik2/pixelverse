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
  return (
    <div className="space-y-8 pb-16">
      {/* 3D Header Cockpit */}
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg">
            <Grid className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // CATALOG MATRIX
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              All Game Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Explore the entire gaming universe categorized into {CATEGORIES.length} genre matrices.
            </p>
          </div>
        </div>

        <span className="glass-chip px-4 py-2 rounded-full text-xs font-black tabular-nums text-[var(--accent)] font-mono self-start md:self-auto">
          {CATEGORIES.reduce((acc, c) => acc + c.game_count, 0).toLocaleString()} Games Indexed
        </span>
      </div>

      {/* 3D Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon_name] || Gamepad2;

          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={() => playSfx('tap')}
              className="card-3d drawer-neon p-6 rounded-2xl border border-white/15 hover:border-[var(--accent)] transition-all group flex items-start gap-4 relative overflow-hidden"
            >
              <div 
                className="gaming-icon-box w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all"
                style={{ backgroundColor: `${cat.color}18`, borderColor: `${cat.color}50`, color: cat.color }}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-white group-hover:text-[var(--accent)] transition-colors truncate">
                    {cat.name}
                  </h2>
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                    {cat.game_count.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 font-medium leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all shrink-0 self-center" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
