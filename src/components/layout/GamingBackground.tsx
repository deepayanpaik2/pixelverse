'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';

/**
 * THE ARCADE HORIZON (Pixelverse Visual Signature)
 *
 * Implements a world-class, cinematic atmospheric horizon in pure, lightweight CSS:
 * - Near-black midnight background with deep indigo/blue-violet gradients
 * - Restrained electric cyan & ultraviolet ambient horizon beam
 * - Geometric perspective grid floor that gently fades into the distance
 * - Zero expensive continuous canvas loops or heavy WebGL overhead
 * - Auto-dims to pure stealth black when a game is actively playing
 */
export function GamingBackground() {
  const { preferences } = useAuth();
  const intensity = preferences?.animation_intensity ?? 'full';
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsPlaying(document.documentElement.dataset.playing === 'true');
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-playing'] });
    return () => observer.disconnect();
  }, []);

  if (intensity === 'minimal' || isPlaying) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-[-12] bg-[#05070f] transition-colors duration-500"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="arcade-horizon fixed inset-0 pointer-events-none overflow-hidden z-[-12] transition-opacity duration-700 select-none"
      aria-hidden="true"
    >
      {/* Soft atmospheric radial depth */}
      <div className="arcade-horizon-ambient" />

      {/* Horizon Luminescence Light Beam */}
      <div className="arcade-horizon-beam" />

      {/* Cyber Perspective Grid Floor */}
      <div className="arcade-horizon-grid" />

      {/* Cinematic Vignette Frame */}
      <div className="arcade-horizon-vignette" />
    </div>
  );
}
