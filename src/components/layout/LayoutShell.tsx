'use client';

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ProfileGate } from './ProfileGate';
import { GamingBackground } from './GamingBackground';
import { FallingGlitter } from './FallingGlitter';
import { PointerFX } from './PointerFX';

const ACCENT_MAP: Record<string, { color: string; rgb: string }> = {
  cyan: { color: '#00f3ff', rgb: '0, 243, 255' },
  purple: { color: '#c084fc', rgb: '192, 132, 252' },
  lime: { color: '#10b981', rgb: '16, 185, 129' },
  coral: { color: '#ff2a85', rgb: '255, 42, 133' },
  gold: { color: '#f59e0b', rgb: '245, 158, 11' },
  neon: { color: '#00f3ff', rgb: '0, 243, 255' },
  sunset: { color: '#ff7b00', rgb: '255, 123, 0' },
  forest: { color: '#4ade80', rgb: '74, 222, 128' },
  crimson: { color: '#ff1e42', rgb: '255, 30, 66' },
};

function ThemeApplicator() {
  const { preferences } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    const theme = preferences?.theme || 'dark';
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Only set inline custom accent override if user explicitly selected a non-default accent
    if (preferences?.accent_color && preferences.accent_color !== 'cyan') {
      const accent = ACCENT_MAP[preferences.accent_color];
      if (accent) {
        root.style.setProperty('--accent', accent.color);
        root.style.setProperty('--accent-rgb', accent.rgb);
        root.style.setProperty('--accent-glow', `rgba(${accent.rgb}, 0.45)`);
      }
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-rgb');
      root.style.removeProperty('--accent-glow');
    }
  }, [preferences?.theme, preferences?.accent_color]);

  return null;
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeApplicator />
      
          <div className="grain relative isolate min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
            {/* Skip link for keyboard / screen reader users */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <GamingBackground />
            <FallingGlitter />
            <PointerFX />
            <ProfileGate />
            <Navbar />
            <div className="flex-1 flex w-full">
              <Sidebar />
              <div className="flex-1 min-w-0 flex flex-col">
                <main id="main-content" className="flex-1 min-w-0 p-2 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-8">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </div>
        
    </AuthProvider>
  );
}
