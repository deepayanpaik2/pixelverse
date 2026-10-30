'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Gamepad2, Heart } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { STATIC_CATEGORIES } from '@/lib/games/static-categories';
import { playSfx } from '@/lib/sfx';

export function Footer() {
  return (
    <footer className="drawer-neon border-t border-white/10 mt-20 text-xs text-slate-400 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 py-14 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link
              href="/"
              onClick={() => playSfx('tap')}
              className="flex items-center gap-3 group w-fit"
            >
              <BrandMark className="w-8 h-8 drop-shadow-[0_0_12px_var(--accent-glow)] group-hover:scale-110 transition-transform" />
              <span className="font-display text-2xl font-black text-gradient group-hover:text-[var(--accent)] transition-colors">
                Pixelverse
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 font-medium">
              Browser gaming platform. Instant play, zero installs, accessible on mobile and desktop.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[var(--accent)] font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              <span>ARCADE ONLINE • 14,000+ TITLES</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[var(--accent)]" /> Categories
            </h4>
            <div className="flex flex-col space-y-1.5 text-xs font-semibold">
              {STATIC_CATEGORIES.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={() => playSfx('tap')}
                  className="hover:text-[var(--accent)] hover:translate-x-1 border border-transparent rounded-lg py-1 transition-all"
                >
                  {c.name} Games
                </Link>
              ))}
            </div>
          </div>

          {/* Discovery & Community */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Discovery
            </h4>
            <div className="flex flex-col space-y-1.5 text-xs font-semibold">
              <Link
                href="/trending"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                Trending Games
              </Link>
              <Link
                href="/new"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                New Releases
              </Link>
              <Link
                href="/category/multiplayer"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                2 Player & Multiplayer
              </Link>
              <Link
                href="/categories"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                Full Category Index
              </Link>
              <Link
                href="/submit"
                onClick={() => playSfx('tap')}
                className="hover:text-emerald-400 font-bold hover:translate-x-1 py-1 transition-all"
              >
                Submit Your Game
              </Link>
            </div>
          </div>

          {/* Legal & Safety */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent)]" /> Safety & Legal
            </h4>
            <div className="flex flex-col space-y-1.5 text-xs font-semibold">
              <Link
                href="/about"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                About Pixelverse
              </Link>
              <Link
                href="/dmca"
                onClick={() => playSfx('tap')}
                className="hover:text-rose-400 font-bold hover:translate-x-1 py-1 transition-all"
              >
                DMCA & Copyright
              </Link>
              <Link
                href="/privacy"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                onClick={() => playSfx('tap')}
                className="hover:text-[var(--accent)] hover:translate-x-1 py-1 transition-all"
              >
                Contact & Support
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-400 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Pixelverse Gaming Universe.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              Maintained by <a href="https://github.com/deepayanpaik2" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline font-bold">Deepayan</a>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-[var(--accent)] drop-shadow-sm" />
            <span>Hardware accelerated • Sandboxed secure runtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
