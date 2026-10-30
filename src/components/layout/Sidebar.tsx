'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Clock, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  Crown, 
  Users, 
  Trophy, 
  Heart, 
  Settings,
  Zap,
  Compass,
  Gamepad2,
  Grid,
  Car,
  Crosshair,
  Puzzle,
  Smile,
  Layers,
  Sparkle
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { playSfx } from '@/lib/sfx';

export function Sidebar() {
  const pathname = usePathname();
  const { favorites } = useAuth();

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home, isHome: true },
    { label: 'Recently played', href: '/history', icon: Clock },
    { label: 'New', href: '/new', icon: Sparkles },
    { label: 'Hot Games', href: '/trending', icon: Flame },
    { label: 'Multiplayer', href: '/category/multiplayer', icon: Users },
    { label: 'Leaderboards', href: '/top-rated', icon: Trophy },
    { 
      label: 'Favorites', 
      href: '/favorites', 
      icon: Heart, 
      badge: favorites.length > 0 ? favorites.length : undefined 
    },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // CrazyGames-style category icons
  const categoryNavItems = [
    { name: 'Action', slug: 'action', icon: Zap },
    { name: 'Adventure', slug: 'adventure', icon: Compass },
    { name: 'Arcade', slug: 'arcade', icon: Gamepad2 },
    { name: 'Board', slug: 'board', icon: Grid },
    { name: 'Card', slug: 'card', icon: Layers },
    { name: 'Driving', slug: 'driving', icon: Car },
    { name: 'Shooting', slug: 'shooting', icon: Crosshair },
    { name: 'Puzzle', slug: 'puzzle', icon: Puzzle },
    { name: 'Casual', slug: 'casual', icon: Smile },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar (CrazyGames style) */}
      <aside className="hidden md:flex flex-col w-16 lg:w-60 drawer-neon border-r border-white/10 h-[calc(100dvh-57px)] sticky top-[57px] z-40 py-3.5 px-2 select-none">
        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-none">
          {/* Main Core Links */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => playSfx('tap')}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[13px] font-extrabold transition-all group relative ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  title={item.label}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 shrink-0 ${
                      item.isHome && isActive
                        ? 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.7)]'
                        : isActive
                        ? 'text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]'
                        : 'text-indigo-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 fill-current" />
                  </div>

                  <span className="hidden lg:inline truncate tracking-tight">{item.label}</span>

                  {item.badge !== undefined && (
                    <span className="hidden lg:flex ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider Line */}
          <div className="my-2.5 mx-2 border-t border-white/10" />

          {/* Category Links with Distinct Icons */}
          <div className="space-y-1">
            <div className="hidden lg:block px-3 py-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                Categories
              </span>
            </div>

            {categoryNavItems.map((cat) => {
              const catHref = `/category/${cat.slug}`;
              const isActive = pathname === catHref;
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.slug}
                  href={catHref}
                  onClick={() => playSfx('tap')}
                  className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all group relative ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  title={cat.name}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 shrink-0 ${
                      isActive
                        ? 'text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]'
                        : 'text-indigo-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 fill-current" />
                  </div>

                  <span className="hidden lg:inline truncate tracking-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Hub Tag */}
        <div className="hidden lg:block pt-3 border-t border-white/10 px-2 text-[10px] text-slate-400 space-y-0.5">
          <div className="font-extrabold text-white flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>Pixelverse Arcade</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-[var(--accent)] opacity-80">v1.0</span>
          </div>
          <div className="text-slate-400 font-medium flex items-center gap-1">
            <span>Crafted by</span>
            <span className="text-[var(--accent)] font-bold">Deepayan</span>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 drawer-neon border-t border-white/15 px-1 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-stretch justify-around">
        {[
          { label: 'Home', href: '/', icon: Home },
          { label: 'Recent', href: '/history', icon: Clock },
          { label: 'New', href: '/new', icon: Sparkles },
          { label: 'Hot', href: '/trending', icon: Flame },
          { label: 'Favorites', href: '/favorites', icon: Heart, badge: favorites.length > 0 ? favorites.length : undefined },
        ].map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => playSfx('tap')}
              className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-black transition-all ${
                isActive ? 'text-[var(--accent)] font-extrabold' : 'text-slate-400 active:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-[var(--accent)]/20 shadow-[0_0_10px_var(--accent-glow)] scale-105' : ''
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5 fill-current" />
              </div>
              <span className="w-full text-center truncate px-0.5 tracking-tight text-[10px]">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0.5 right-[22%] bg-rose-500 text-white text-[9px] min-w-[15px] h-[15px] px-1 rounded-full font-black flex items-center justify-center shadow-md">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
