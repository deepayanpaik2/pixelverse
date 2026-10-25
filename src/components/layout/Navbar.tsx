'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  Baby,
  Globe,
  Upload,
  Palette,
  Check,
  Menu,
  X,
  Gamepad2,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { BrandMark } from './BrandMark';
import { SoundToggle } from './SoundToggle';
import { useAuth } from '@/features/auth/AuthContext';
import { TRANSLATIONS, LanguageCode } from '@/lib/i18n';
import { FEATURED_GAMES } from '@/lib/games';
import { playSfx } from '@/lib/sfx';

interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  primary: string;
  secondary: string;
  badge?: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    tagline: 'Neon Cyan & Hyper Rose',
    primary: '#00f3ff',
    secondary: '#f43f5e',
    badge: 'HOT',
  },
  {
    id: 'synthwave',
    name: 'Outrun Synthwave',
    tagline: 'Retro Pink & Aquamarine',
    primary: '#ff2a85',
    secondary: '#00f5d4',
    badge: 'NEON',
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Matrix',
    tagline: 'Electric Azure & Indigo',
    primary: '#00f0ff',
    secondary: '#6366f1',
    badge: 'POPULAR',
  },
  {
    id: 'sunset-orange',
    name: 'Solar Phoenix',
    tagline: 'Molten Flame & Golden Glow',
    primary: '#ff7b00',
    secondary: '#facc15',
  },
  {
    id: 'forest-green',
    name: 'Emerald Matrix',
    tagline: 'Phosphor Jade & Bio Hacker',
    primary: '#10b981',
    secondary: '#06b6d4',
  },
  {
    id: 'deep-purple',
    name: 'Arcane Void',
    tagline: 'Ethereal Violet & Fuchsia',
    primary: '#a855f7',
    secondary: '#ec4899',
  },
  {
    id: 'bloodforge',
    name: 'Bloodforge Mecha',
    tagline: 'Crimson Plasma & Ember',
    primary: '#ff1e42',
    secondary: '#ff7b00',
  },
  {
    id: 'dark',
    name: 'Opal Noir',
    tagline: 'Deep Obsidian & Pearl Mint',
    primary: '#a9e9df',
    secondary: '#b9a8ff',
    badge: 'CLASSIC',
  },
  {
    id: 'light',
    name: 'Crystal Clean',
    tagline: 'Clean Light & Sky Blue',
    primary: '#0284c7',
    secondary: '#8b5cf6',
  },
  {
    id: 'high-contrast',
    name: 'Ultra Contrast',
    tagline: 'Pure Cyber Yellow & Black',
    primary: '#ffff00',
    secondary: '#ffffff',
  },
];

export function Navbar() {
  const router = useRouter();
  const {
    user,
    kidsMode,
    setKidsMode,
    language,
    setLanguage,
    favorites,
    signOut,
    preferences,
    updatePreferences,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    playSfx('launch');
    router.push(`/arcade?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const suggestions =
    searchQuery.trim().length > 1
      ? FEATURED_GAMES.filter(
          (g) =>
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.category.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
      : [];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const currentTheme = preferences?.theme || 'dark';

  return (
    <header className="sticky top-0 z-50 w-full drawer-neon border-b border-white/[0.12] px-3 sm:px-6 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] backdrop-blur-2xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Section: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="sm:hidden p-2.5 rounded-xl bg-black/50 border border-white/15 text-white hover:border-[var(--accent)] active:scale-95 transition-all shadow-md"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X className="w-5 h-5 text-[var(--accent)]" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Holographic 3D Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0"
            aria-label="Pixelverse home"
            onClick={() => playSfx('tap')}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-[var(--accent)] opacity-20 blur-md group-hover:opacity-60 transition-opacity duration-300" />
              <BrandMark className="relative w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_0_12px_var(--accent-glow)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-2">
                <span className="font-display text-[1.25rem] sm:text-[1.4rem] font-black tracking-tight text-gradient">
                  Pixelverse
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-white/5 border border-white/10 text-slate-300 group-hover:border-[var(--accent)]/50 group-hover:text-[var(--accent)] group-hover:shadow-[0_0_8px_var(--accent-glow)] transition-all">
                  by Deepayan
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 tracking-wider font-semibold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                14,000+ Online Games
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: 3D Cyber Search Terminal */}
        <div className="hidden sm:flex flex-1 max-w-md lg:max-w-lg relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#060810]/80 border border-white/15 text-xs rounded-full pl-10 pr-12 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] shadow-inner transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </form>

          {/* Instant Search Suggestions Box */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 drawer-neon rounded-2xl border border-white/15 overflow-hidden shadow-2xl z-50 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3.5 py-2 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase bg-white/[0.02]">
                Instant Matches
              </div>
              {suggestions.map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.slug}`}
                  onClick={() => {
                    setShowSuggestions(false);
                    playSfx('launch');
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-white/[0.08] hover:border-l-2 hover:border-l-[var(--accent)] transition-all group"
                >
                  <img
                    src={game.thumbnail_url}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-white/15 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-[var(--accent)] truncate transition-colors">
                      {game.title}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-[var(--accent)] font-semibold">{game.category}</span>
                      <span>•</span>
                      <span>{game.supported_players}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Aligned 3D Gaming Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Kids Mode Toggle Pill */}
          <button
            onClick={() => {
              setKidsMode(!kidsMode);
              playSfx('toggle');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all btn-3d ${
              kidsMode
                ? 'bg-emerald-400 text-black shadow-[0_4px_16px_rgba(52,211,153,0.5)] border border-emerald-300'
                : 'bg-black/50 border border-white/15 text-slate-300 hover:text-white hover:border-white/30'
            }`}
            title="Toggle Kids Mode"
          >
            <Baby className="w-4 h-4" />
            <span className="hidden md:inline">Kids Mode</span>
            {kidsMode && (
              <span className="text-[9px] ml-0.5 bg-black/25 px-1.5 py-0.5 rounded font-mono font-black">
                ON
              </span>
            )}
          </button>

          {/* Submit Game Link */}
          <Link
            href="/submit"
            onClick={() => playSfx('tap')}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-black text-slate-200 hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all btn-3d"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Submit</span>
          </Link>

          <SoundToggle />

          {/* 3D THEME CUSTOMIZER BUTTON & MENU */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowLangMenu(false);
                setShowUserMenu(false);
                playSfx('tap');
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl bg-black/60 border text-xs font-black transition-all flex items-center gap-2 btn-3d ${
                showThemeMenu
                  ? 'border-[var(--accent)] text-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)]'
                  : 'border-white/15 text-slate-200 hover:text-white hover:border-[var(--accent)]/60'
              }`}
              title="Select Gaming Theme"
              aria-label="Select Gaming Theme"
            >
              <Palette className="w-4 h-4 text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]" />
              <span className="hidden xl:inline text-[11px] uppercase tracking-wide">Theme</span>
            </button>

            {/* Luxurious 3D Theme Customizer Dropdown Drawer */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 drawer-neon rounded-2xl border border-white/20 p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Cyber Theme Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded-full border border-[var(--accent)]/40 font-bold">
                    10 THEMES
                  </span>
                </div>

                {/* Theme Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                  {THEME_OPTIONS.map((th) => {
                    const isActive = currentTheme === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => {
                          updatePreferences({ theme: th.id as any });
                          playSfx('launch');
                          setShowThemeMenu(false);
                        }}
                        className={`group relative flex flex-col p-2.5 rounded-xl border text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-white/[0.08] border-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)] scale-[1.02]'
                            : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Top: Swatch & Badge */}
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {/* Dual Color Swatch Orb */}
                            <div className="flex -space-x-1.5 items-center">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                                style={{ backgroundColor: th.primary }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                                style={{ backgroundColor: th.secondary }}
                              />
                            </div>
                            {th.badge && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
                                {th.badge}
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Name & Tagline */}
                        <div className="text-[11px] font-black text-white group-hover:text-[var(--accent)] transition-colors truncate">
                          {th.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate font-medium">
                          {th.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* i18n Language Dropdown */}
          <div className="relative hidden sm:block" ref={langRef}>
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowThemeMenu(false);
                setShowUserMenu(false);
                playSfx('tap');
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5 text-xs font-bold btn-3d"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-[var(--accent)]" />
              <span className="uppercase text-[11px] hidden md:inline">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-3 w-44 drawer-neon rounded-2xl border border-white/15 p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-top-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                      playSfx('toggle');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${
                      language === l.code
                        ? 'bg-[var(--accent)] text-black font-black'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Pill */}
          <Link
            href="/favorites"
            onClick={() => playSfx('tap')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 transition-all relative flex items-center gap-1.5 btn-3d"
            title="Saved Favorites"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            {favorites.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowThemeMenu(false);
                  setShowLangMenu(false);
                  playSfx('tap');
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/15 hover:border-[var(--accent)] transition-all btn-3d"
              >
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover border border-white/20"
                />
                <span className="text-xs font-black text-white hidden md:block max-w-[85px] truncate pr-1">
                  {user.display_name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 drawer-neon rounded-2xl border border-white/15 p-2 shadow-2xl z-50 space-y-1 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-white/10 text-slate-400">
                    <div className="font-extrabold text-white truncate">{user.display_name}</div>
                    <div className="text-[10px] text-[var(--accent)] font-mono">@{user.username}</div>
                  </div>
                  <Link
                    href={`/u/${user.username}`}
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white font-bold"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white font-bold"
                  >
                    Play History
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white font-bold"
                  >
                    Settings
                  </Link>
                  {user.is_admin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 font-extrabold"
                    >
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                      playSfx('launch');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={() => playSfx('tap')}
              className="btn-gaming px-5 py-2.5 rounded-full font-black text-xs whitespace-nowrap shadow-[0_4px_16px_var(--accent-glow)] flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 fill-current" /> Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenu && (
        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 drawer-neon rounded-2xl p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060810] border border-white/15 text-xs rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-400"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-200 pt-1">
            <Link
              href="/trending"
              onClick={() => setMobileMenu(false)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              🔥 Trending
            </Link>
            <Link
              href="/new"
              onClick={() => setMobileMenu(false)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              ✨ New Releases
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenu(false)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              🎮 Categories
            </Link>
            <Link
              href="/submit"
              onClick={() => setMobileMenu(false)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[var(--accent)]"
            >
              🚀 Submit Game
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
