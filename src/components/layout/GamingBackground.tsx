'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';

/**
 * Ambient background visual layer.
 * Respects animation intensity and reduced motion preferences.
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

  useEffect(() => {
    if (intensity === 'minimal' || isPlaying) return;
    const root = document.documentElement;
    root.classList.add('gaming-bg');
    return () => root.classList.remove('gaming-bg');
  }, [intensity, isPlaying]);

  // Generate lightweight deterministic floating cyber particles (lean count for zero thermal overhead)
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (i * 24.3) % 100,
      y: (i * 29.7) % 100,
      size: 2 + (i % 2) * 2,
      duration: 22 + (i % 3) * 8,
      delay: -(i * 3.1),
      type: i % 2 === 0 ? 'diamond' : 'dot',
      opacity: 0.12 + (i % 2) * 0.1,
    }));
  }, []);

  if (intensity === 'minimal' || isPlaying) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-12]" aria-hidden="true">
      {/* Dynamic Cosmic Nebula */}
      <div className="nebula">
        <span />
        <span />
        <span />
      </div>

      {/* Cyber 3D Grid Floor */}
      <div className="grid-floor" />

      {/* Laser Horizon Beam */}
      <div className="cyber-horizon" />

      {/* Floating 3D Gaming HUD Particles (desktop only) */}
      {intensity !== 'reduced' && (
        <div className="absolute inset-0 hidden sm:block">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                opacity: p.opacity,
                animation: `float-particle ${p.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.type === 'diamond' ? (
                <div
                  className="w-2 h-2 rotate-45 border border-[var(--accent)] bg-[var(--accent-glow)]"
                />
              ) : (
                <div
                  className="rounded-full bg-[var(--accent)]"
                  style={{ width: `${p.size}px`, height: `${p.size}px` }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ambient Radial Vignette for cinema depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, transparent 20%, rgba(0, 0, 0, 0.45) 80%, rgba(0, 0, 0, 0.75) 100%)',
        }}
      />
    </div>
  );
}
