'use client';

import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';

/**
 * THE ARCADE HORIZON (Pixelverse Signature Atmospheric Background)
 *
 * Implements a world-class, cinematic atmospheric horizon in pure, lightweight CSS:
 * - Near-black midnight background with deep indigo/blue-violet gradients
 * - Restrained electric cyan & ultraviolet ambient horizon beam with breathing pulse
 * - Infinite perspective grid floor with silky-smooth GPU-composited forward glide
 * - Floating cyber stardust depth layer
 * - Dynamic reactive route and theme color adaptation
 * - Zero expensive continuous canvas loops or heavy WebGL overhead
 * - Stays active and alive on ALL pages (including game pages, rooms, catalog, and home)
 */
export function GamingBackground() {
  const { preferences } = useAuth();
  const intensity = preferences?.animation_intensity ?? 'full';

  if (intensity === 'minimal') {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#05070f]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="arcade-horizon fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Dynamic Cosmic Nebulae Orbs */}
      <div className="arcade-horizon-nebula arcade-horizon-nebula-left" />
      <div className="arcade-horizon-nebula arcade-horizon-nebula-right" />

      {/* Floating Cyber Dust / Stars */}
      <div className="arcade-horizon-dust" />

      {/* Horizon Luminescence Light Beam */}
      <div className="arcade-horizon-beam" />

      {/* Cyber Perspective Grid Floor with Smooth Forward Glide */}
      <div className="arcade-horizon-grid" />

      {/* Cinematic Vignette Frame */}
      <div className="arcade-horizon-vignette" />
    </div>
  );
}
