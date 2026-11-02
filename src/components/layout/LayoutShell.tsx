'use client';

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { VoiceProvider } from '@/features/voice/VoiceContext';
import { ChatProvider } from '@/features/chat/ChatContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ProfileGate } from './ProfileGate';
import { GamingBackground } from './GamingBackground';
import { CyberCursor } from './CyberCursor';

const ACCENT_MAP: Record<string, { color: string; rgb: string; secondary?: string; secondaryRgb?: string }> = {
  cyan: { color: '#00f0ff', rgb: '0, 240, 255', secondary: '#8b5cf6', secondaryRgb: '139, 92, 246' },
  purple: { color: '#c084fc', rgb: '192, 132, 252', secondary: '#f43f5e', secondaryRgb: '244, 63, 94' },
  lime: { color: '#10b981', rgb: '16, 185, 129', secondary: '#06b6d4', secondaryRgb: '6, 182, 212' },
  coral: { color: '#ff2a85', rgb: '255, 42, 133', secondary: '#00f5d4', secondaryRgb: '0, 245, 212' },
  gold: { color: '#f59e0b', rgb: '245, 158, 11', secondary: '#f43f5e', secondaryRgb: '244, 63, 94' },
  neon: { color: '#00f0ff', rgb: '0, 240, 255', secondary: '#8b5cf6', secondaryRgb: '139, 92, 246' },
  sunset: { color: '#ff7b00', rgb: '255, 123, 0', secondary: '#ec4899', secondaryRgb: '236, 72, 153' },
  forest: { color: '#4ade80', rgb: '74, 222, 128', secondary: '#14b8a6', secondaryRgb: '20, 184, 166' },
  crimson: { color: '#ff1e42', rgb: '255, 30, 66', secondary: '#f59e0b', secondaryRgb: '245, 158, 11' },
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
      }
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-rgb');
      root.style.removeProperty('--accent-glow');
      root.style.removeProperty('--accent-secondary');
      root.style.removeProperty('--accent-secondary-rgb');
    }
  }, [preferences?.theme, preferences?.accent_color]);

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

            {/* Cinematic Arcade Horizon background layer: fixed behind everything on ALL pages */}
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
