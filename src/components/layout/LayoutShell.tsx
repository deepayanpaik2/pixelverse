'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { VoiceProvider } from '@/features/voice/VoiceContext';
import { ChatProvider } from '@/features/chat/ChatContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ProfileGate } from './ProfileGate';
import { GamingBackground } from './GamingBackground';
import { CyberCursor } from './CyberCursor';
import { getGameBySlug } from '@/lib/games';

const ACCENT_MAP: Record<string, { color: string; rgb: string; secondary?: string; secondaryRgb?: string }> = {
  cyan: { color: '#00f0ff', rgb: '0, 240, 255', secondary: '#8b5cf6', secondaryRgb: '139, 92, 246' },
  purple: { color: '#c084fc', rgb: '192, 132, 252', secondary: '#f43f5e', secondaryRgb: '244, 63, 94' },
  lime: { color: '#10b981', rgb: '16, 185, 129', secondary: '#00f0ff', secondaryRgb: '0, 240, 255' },
  coral: { color: '#ff2a85', rgb: '255, 42, 133', secondary: '#f43f5e', secondaryRgb: '244, 63, 94' },
  gold: { color: '#f59e0b', rgb: '245, 158, 11', secondary: '#fbbf24', secondaryRgb: '251, 191, 36' },
  neon: { color: '#00f0ff', rgb: '0, 240, 255', secondary: '#a855f7', secondaryRgb: '168, 85, 247' },
  sunset: { color: '#ff7b00', rgb: '255, 123, 0', secondary: '#facc15', secondaryRgb: '250, 204, 21' },
  forest: { color: '#4ade80', rgb: '74, 222, 128', secondary: '#06b6d4', secondaryRgb: '6, 182, 212' },
  crimson: { color: '#ff1e42', rgb: '255, 30, 66', secondary: '#ff7b00', secondaryRgb: '255, 123, 0' },
};

interface RouteAmbiance {
  primary: string;
  primaryRgb: string;
  secondary: string;
  secondaryRgb: string;
  glow: string;
  grid: string;
}

function getRouteAmbiance(pathname: string): RouteAmbiance {
  if (!pathname || pathname === '/') {
    // Signature Arcade Horizon: Midnight Cyan & Deep Violet
    return {
      primary: '#00f0ff',
      primaryRgb: '0, 240, 255',
      secondary: '#8b5cf6',
      secondaryRgb: '139, 92, 246',
      glow: 'rgba(0, 240, 255, 0.45)',
      grid: 'rgba(0, 240, 255, 0.22)',
    };
  }

  // Active Game Pages: Dynamically theme based on the game's actual category
  if (pathname.startsWith('/game/')) {
    const slug = pathname.replace('/game/', '').split('/')[0];
    const game = getGameBySlug(slug);
    const cat = (game?.category || slug).toLowerCase();

    if (cat.includes('match') || cat.includes('prism') || cat.includes('candy') || cat.includes('gem')) {
      return {
        primary: '#00f5d4',
        primaryRgb: '0, 245, 212',
        secondary: '#f43f5e',
        secondaryRgb: '244, 63, 94',
        glow: 'rgba(0, 245, 212, 0.45)',
        grid: 'rgba(0, 245, 212, 0.22)',
      };
    }
    if (cat.includes('puzzle') || cat.includes('brain') || cat.includes('logic')) {
      return {
        primary: '#a855f7',
        primaryRgb: '168, 85, 247',
        secondary: '#ec4899',
        secondaryRgb: '236, 72, 153',
        glow: 'rgba(168, 85, 247, 0.45)',
        grid: 'rgba(168, 85, 247, 0.22)',
      };
    }
    if (cat.includes('driving') || cat.includes('car') || cat.includes('racing') || cat.includes('speed')) {
      return {
        primary: '#ff8800',
        primaryRgb: '255, 136, 0',
        secondary: '#facc15',
        secondaryRgb: '250, 204, 21',
        glow: 'rgba(255, 136, 0, 0.45)',
        grid: 'rgba(255, 136, 0, 0.22)',
      };
    }
    if (cat.includes('action') || cat.includes('fighting') || cat.includes('war') || cat.includes('temple')) {
      return {
        primary: '#ff1e42',
        primaryRgb: '255, 30, 66',
        secondary: '#ff7b00',
        secondaryRgb: '255, 123, 0',
        glow: 'rgba(255, 30, 66, 0.45)',
        grid: 'rgba(255, 30, 66, 0.22)',
      };
    }
    if (cat.includes('shooter') || cat.includes('gun') || cat.includes('fps')) {
      return {
        primary: '#ef4444',
        primaryRgb: '239, 68, 68',
        secondary: '#f97316',
        secondaryRgb: '249, 115, 22',
        glow: 'rgba(239, 68, 68, 0.45)',
        grid: 'rgba(239, 68, 68, 0.22)',
      };
    }
    if (cat.includes('sports') || cat.includes('football') || cat.includes('soccer') || cat.includes('basketball')) {
      return {
        primary: '#10b981',
        primaryRgb: '16, 185, 129',
        secondary: '#facc15',
        secondaryRgb: '250, 204, 21',
        glow: 'rgba(16, 185, 129, 0.45)',
        grid: 'rgba(16, 185, 129, 0.22)',
      };
    }
    // Default game arena: Electric Cyan & Crimson
    return {
      primary: '#00f0ff',
      primaryRgb: '0, 240, 255',
      secondary: '#f43f5e',
      secondaryRgb: '244, 63, 94',
      glow: 'rgba(0, 240, 255, 0.45)',
      grid: 'rgba(0, 240, 255, 0.22)',
    };
  }

  if (pathname.startsWith('/rooms')) {
    // Multiplayer Party Arena: Neon Amethyst & Hot Rose
    return {
      primary: '#c084fc',
      primaryRgb: '192, 132, 252',
      secondary: '#f43f5e',
      secondaryRgb: '244, 63, 94',
      glow: 'rgba(192, 132, 252, 0.45)',
      grid: 'rgba(192, 132, 252, 0.22)',
    };
  }

  if (pathname.startsWith('/trending') || pathname.startsWith('/hot')) {
    // Trending Hot Games: Molten Solar Flare & Amber
    return {
      primary: '#ff7b00',
      primaryRgb: '255, 123, 0',
      secondary: '#facc15',
      secondaryRgb: '250, 204, 21',
      glow: 'rgba(255, 123, 0, 0.45)',
      grid: 'rgba(255, 123, 0, 0.22)',
    };
  }

  if (pathname.startsWith('/new')) {
    // Fresh Releases: Emerald Cyber Matrix & Electric Mint
    return {
      primary: '#10b981',
      primaryRgb: '16, 185, 129',
      secondary: '#00f0ff',
      secondaryRgb: '0, 240, 255',
      glow: 'rgba(16, 185, 129, 0.45)',
      grid: 'rgba(16, 185, 129, 0.22)',
    };
  }

  if (pathname.startsWith('/top-rated') || pathname.startsWith('/leaderboards')) {
    // Championship Leaderboards: Imperial Gold & Champagne
    return {
      primary: '#f59e0b',
      primaryRgb: '245, 158, 11',
      secondary: '#fbbf24',
      secondaryRgb: '251, 191, 36',
      glow: 'rgba(245, 158, 11, 0.45)',
      grid: 'rgba(245, 158, 11, 0.22)',
    };
  }

  if (pathname.startsWith('/favorites')) {
    // Favorites: Heartbeat Neon Rose & Fuchsia
    return {
      primary: '#ff2a85',
      primaryRgb: '255, 42, 133',
      secondary: '#f43f5e',
      secondaryRgb: '244, 63, 94',
      glow: 'rgba(255, 42, 133, 0.45)',
      grid: 'rgba(255, 42, 133, 0.22)',
    };
  }

  if (pathname.startsWith('/history')) {
    // Chrono History: Ice Azure & Deep Cobalt
    return {
      primary: '#38bdf8',
      primaryRgb: '56, 189, 248',
      secondary: '#818cf8',
      secondaryRgb: '129, 140, 248',
      glow: 'rgba(56, 189, 248, 0.45)',
      grid: 'rgba(56, 189, 248, 0.22)',
    };
  }

  if (pathname.includes('multiplayer')) {
    return {
      primary: '#c084fc',
      primaryRgb: '192, 132, 252',
      secondary: '#f43f5e',
      secondaryRgb: '244, 63, 94',
      glow: 'rgba(192, 132, 252, 0.45)',
      grid: 'rgba(192, 132, 252, 0.22)',
    };
  }

  if (pathname.includes('action')) {
    // Action Arena: Crimson Laser
    return {
      primary: '#ff1e42',
      primaryRgb: '255, 30, 66',
      secondary: '#ff7b00',
      secondaryRgb: '255, 123, 0',
      glow: 'rgba(255, 30, 66, 0.45)',
      grid: 'rgba(255, 30, 66, 0.22)',
    };
  }

  if (pathname.includes('driving')) {
    // Nitro Driving: High-Octane Tangerine
    return {
      primary: '#ff8800',
      primaryRgb: '255, 136, 0',
      secondary: '#facc15',
      secondaryRgb: '250, 204, 21',
      glow: 'rgba(255, 136, 0, 0.45)',
      grid: 'rgba(255, 136, 0, 0.22)',
    };
  }

  if (pathname.includes('puzzle') || pathname.includes('brain')) {
    // Mind Puzzle: Cosmic Violet & Pink
    return {
      primary: '#a855f7',
      primaryRgb: '168, 85, 247',
      secondary: '#ec4899',
      secondaryRgb: '236, 72, 153',
      glow: 'rgba(168, 85, 247, 0.45)',
      grid: 'rgba(168, 85, 247, 0.22)',
    };
  }

  if (pathname.includes('shooting')) {
    // Shooting Crosshair: Tactical Scarlet
    return {
      primary: '#ef4444',
      primaryRgb: '239, 68, 68',
      secondary: '#f97316',
      secondaryRgb: '249, 115, 22',
      glow: 'rgba(239, 68, 68, 0.45)',
      grid: 'rgba(239, 68, 68, 0.22)',
    };
  }

  if (pathname.includes('adventure')) {
    // Adventure Expedition: Mystical Turquoise
    return {
      primary: '#14b8a6',
      primaryRgb: '20, 184, 166',
      secondary: '#06b6d4',
      secondaryRgb: '6, 182, 212',
      glow: 'rgba(20, 184, 166, 0.45)',
      grid: 'rgba(20, 184, 166, 0.22)',
    };
  }

  if (pathname.startsWith('/settings')) {
    return {
      primary: '#38bdf8',
      primaryRgb: '56, 189, 248',
      secondary: '#c084fc',
      secondaryRgb: '192, 132, 252',
      glow: 'rgba(56, 189, 248, 0.45)',
      grid: 'rgba(56, 189, 248, 0.22)',
    };
  }

  // Default Cyber Arcade Horizon
  return {
    primary: '#00f0ff',
    primaryRgb: '0, 240, 255',
    secondary: '#8b5cf6',
    secondaryRgb: '139, 92, 246',
    glow: 'rgba(0, 240, 255, 0.45)',
    grid: 'rgba(0, 240, 255, 0.22)',
  };
}

function ThemeApplicator() {
  const { preferences } = useAuth();
  const pathname = usePathname() || '/';

  useEffect(() => {
    const root = document.documentElement;
    const theme = preferences?.theme || 'dark';
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // If the user manually selected an explicit accent color in settings, honor it everywhere
    if (preferences?.accent_color && preferences.accent_color !== 'cyan') {
      const accent = ACCENT_MAP[preferences.accent_color];
      if (accent) {
        root.style.setProperty('--accent', accent.color);
        root.style.setProperty('--accent-rgb', accent.rgb);
        root.style.setProperty('--accent-glow', `rgba(${accent.rgb}, 0.5)`);
        if (accent.secondary) {
          root.style.setProperty('--accent-secondary', accent.secondary);
        }
        if (accent.secondaryRgb) {
          root.style.setProperty('--accent-secondary-rgb', accent.secondaryRgb);
        }
        root.style.setProperty('--grid-color', `rgba(${accent.rgb}, 0.22)`);
      }
      return;
    }

    // Dynamic per-page ambiance palette when on default accent:
    // Background horizon, nebulae, stardust, cursor reticle, and mobile tap ripples
    // smoothly adapt to each page/category in real-time!
    const ambiance = getRouteAmbiance(pathname);
    root.style.setProperty('--accent', ambiance.primary);
    root.style.setProperty('--accent-rgb', ambiance.primaryRgb);
    root.style.setProperty('--accent-secondary', ambiance.secondary);
    root.style.setProperty('--accent-secondary-rgb', ambiance.secondaryRgb);
    root.style.setProperty('--accent-glow', ambiance.glow);
    root.style.setProperty('--grid-color', ambiance.grid);
  }, [preferences?.theme, preferences?.accent_color, pathname]);

  return null;
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeApplicator />
      <VoiceProvider>
        <ChatProvider>
          {/* Main layout container with guaranteed clean stacking context */}
          <div className="relative min-h-screen flex flex-col text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
            {/* Skip link for keyboard / screen reader users */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {/* Cinematic Arcade Horizon background layer: fixed behind everything */}
            <GamingBackground />

            {/* Zero-lag interactive cursor & touch shockwaves: floating on top */}
            <CyberCursor />

            {/* Interactive UI content layer */}
            <div className="relative z-10 flex-1 flex flex-col min-h-screen">
              <ProfileGate />
              <Navbar />
              <div className="flex-1 flex w-full">
                <Sidebar />
                <div className="flex-1 min-w-0 flex flex-col">
                  <main
                    id="main-content"
                    className="flex-1 min-w-0 p-2 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-8"
                  >
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
            </div>
          </div>
        </ChatProvider>
      </VoiceProvider>
    </AuthProvider>
  );
}
