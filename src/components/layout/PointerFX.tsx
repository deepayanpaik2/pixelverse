'use client';

import { useEffect } from 'react';
import { playSfx, unlockSfx, SfxName } from '@/lib/sfx';

/**
 * Every press gets an answer: a ring that opens where you touched, a few opal sparks,
 * and a sound. Pressing something that matters (a game, the Play button) gets a bigger burst.
 * Everything is created and cleaned up outside React, so it never re-renders the page.
 */
const COLORS = ['#f7c6da', '#bfe9ee', '#b9a8ff', '#f3dca8', '#ffffff'];
const INTERACTIVE = 'a, button, [role="button"], summary, label, select, input[type="checkbox"], input[type="radio"], .glass-chip, .game-tile';
const PLAYABLE = '.game-tile, [data-sfx], a[href^="/game/"]';

function spawn(layer: HTMLElement, x: number, y: number, strong: boolean) {
  if (layer.childElementCount > 90) return;

  const ring = document.createElement('div');
  ring.style.cssText =
    `position:absolute;left:${x}px;top:${y}px;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;` +
    'border:1.5px solid var(--accent, rgba(0,243,255,.95));box-shadow:0 0 18px var(--accent-glow, rgba(0,243,255,.6)),inset 0 0 10px rgba(255,255,255,.5);pointer-events:none;';
  layer.appendChild(ring);
  ring.animate(
    [{ transform: 'scale(.3)', opacity: 0.95 }, { transform: `scale(${strong ? 8 : 4.4})`, opacity: 0 }],
    { duration: strong ? 820 : 580, easing: 'cubic-bezier(.16,.84,.3,1)' }
  ).onfinish = () => ring.remove();

  const n = strong ? 14 : 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
    const d = (strong ? 48 : 26) + Math.random() * (strong ? 56 : 28);
    const s = 3 + Math.random() * 3.5;
    const c = COLORS[(Math.random() * COLORS.length) | 0];
    const p = document.createElement('div');
    p.style.cssText =
      `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;` +
      `background:${c};box-shadow:0 0 8px ${c};`;
    layer.appendChild(p);
    p.animate(
      [
        { transform: 'translate(0,0) rotate(45deg) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 8}px) rotate(225deg) scale(0)`, opacity: 0 },
      ],
      { duration: 520 + Math.random() * 360, easing: 'cubic-bezier(.12,.8,.3,1)' }
    ).onfinish = () => p.remove();
  }
}

export function PointerFX() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layer = document.createElement('div');
    layer.className = 'fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const soundFor = (t: Element | null): SfxName => {
      const tagged = t?.closest<HTMLElement>('[data-sfx]')?.dataset.sfx as SfxName | undefined;
      if (tagged) return tagged;
      if (t?.closest('.game-tile')) return 'open';
      if (t?.closest('.glass-chip, input[type="checkbox"], input[type="radio"]')) return 'toggle';
      return t?.closest(INTERACTIVE) ? 'tap' : 'soft';
    };

    const onDown = (e: PointerEvent) => {
      if (document.documentElement.dataset.playing === 'true') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      unlockSfx();
      const t = e.target instanceof Element ? e.target : null;
      const name = soundFor(t);
      playSfx(name);
      // Only spawn animated particles on mouse clicks to keep mobile touch scrolling 100% lag-free and cool
      if (!reduce && e.pointerType === 'mouse') {
        spawn(layer, e.clientX, e.clientY, name === 'launch' || name === 'open');
      }
    };

    let lastHover: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (document.documentElement.dataset.playing === 'true') return;
      if (e.pointerType !== 'mouse') return;
      const t = e.target instanceof Element ? e.target.closest(PLAYABLE) : null;
      if (t && t !== lastHover) playSfx('hover');
      lastHover = t;
    };

    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerover', onOver);
      layer.remove();
    };
  }, []);

  return null;
}
