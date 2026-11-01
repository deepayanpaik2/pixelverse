'use client';

import React, { useEffect, useRef } from 'react';
import { unlockSfx, playSfx, SfxName } from '@/lib/sfx';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, summary, .arcade-card, .game-card, [tabindex="0"], .clickable, [data-sfx]';

const PLAYABLE_SELECTOR = '.game-card, .arcade-card, [data-sfx], a[href^="/game/"]';

export function CyberCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fxLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Desktop vs Mobile Touch separation
    const isTouchOnly =
      window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;

    // Desktop Custom Cursor state
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isMouseDown = false;
    let isVisible = false;
    let rafId: number | null = null;
    let isIdle = true;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const fxLayer = fxLayerRef.current;

    // Touch / Mobile Shockwave Particle Spawner
    const spawnTouchEffect = (x: number, y: number, strong = false) => {
      if (!fxLayer || fxLayer.childElementCount > 60) return;

      // Radiant Electric Shockwave Ring
      const ripple = document.createElement('div');
      ripple.className = 'cyber-touch-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '16px';
      ripple.style.height = '16px';
      ripple.style.margin = '-8px 0 0 -8px';

      fxLayer.appendChild(ripple);
      ripple
        .animate(
          [
            { transform: 'scale(0.3)', opacity: 0.95 },
            { transform: `scale(${strong ? 5.5 : 3.8})`, opacity: 0 },
          ],
          { duration: strong ? 480 : 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        )
        .onfinish = () => ripple.remove();

      // Cyber Diamond Sparks using reactive route colors
      const accentColor =
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00f0ff';
      const secondaryColor =
        getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#8b5cf6';
      const sparkPalette = [accentColor, '#ffffff', secondaryColor, '#38bdf8', '#ffffff'];

      const sparkCount = strong ? 8 : 5;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = (strong ? 32 : 18) + Math.random() * (strong ? 40 : 22);
        const size = 3 + Math.random() * 3;
        const color = sparkPalette[Math.floor(Math.random() * sparkPalette.length)];

        const spark = document.createElement('div');
        spark.className = 'cyber-touch-spark';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
        spark.style.background = color;
        spark.style.boxShadow = `0 0 6px ${color}`;

        fxLayer.appendChild(spark);
        spark
          .animate(
            [
              { transform: 'translate(0, 0) scale(1) rotate(45deg)', opacity: 1 },
              {
                transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0) rotate(180deg)`,
                opacity: 0,
              },
            ],
            { duration: 320 + Math.random() * 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
          )
          .onfinish = () => spark.remove();
      }
    };

    // Smooth Cursor Animation Loop
    const loop = () => {
      if (!dot || !ring) return;

      const dx = mouseX - ringX;
      const dy = mouseY - ringY;

      ringX += dx * 0.22;
      ringY += dy * 0.22;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) rotate(${isHovering ? 45 : 0}deg)`;

      // Idle sleep: if distance is negligible, stop loop to save CPU
      if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15 && !isHovering && !isMouseDown) {
        ringX = mouseX;
        ringY = mouseY;
        isIdle = true;
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    const wakeLoop = () => {
      if (isIdle) {
        isIdle = false;
        rafId = requestAnimationFrame(loop);
      }
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // Will settle and sleep naturally in loop()
      }, 150);
    };

    const soundForElement = (target: Element | null): SfxName => {
      const tagged = target?.closest<HTMLElement>('[data-sfx]')?.dataset.sfx as SfxName | undefined;
      if (tagged) return tagged;
      if (target?.closest(PLAYABLE_SELECTOR)) return 'open';
      if (target?.closest('input[type="checkbox"], input[type="radio"], select')) return 'toggle';
      return target?.closest(INTERACTIVE_SELECTOR) ? 'tap' : 'soft';
    };

    let lastHoverTarget: Element | null = null;

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      if ('pointerType' in e && e.pointerType === 'touch') return;

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        document.body.classList.add('cyber-cursor-enabled');
        dot?.classList.remove('cyber-cursor-hidden');
        ring?.classList.remove('cyber-cursor-hidden');
      }

      // Check hovering interactive target
      const target = e.target instanceof Element ? e.target : null;
      const isInput = !!target?.closest('input, textarea, select, [contenteditable="true"]');
      const interactive = target ? target.closest(INTERACTIVE_SELECTOR) : null;
      const shouldHover = !!interactive || isInput;

      if (ring) {
        ring.dataset.input = isInput ? 'true' : 'false';
      }

      if (shouldHover !== isHovering) {
        isHovering = shouldHover;
        if (ring) ring.dataset.hover = isHovering ? 'true' : 'false';
        if (dot) dot.dataset.hover = isHovering ? 'true' : 'false';
      }

      const playable = target ? target.closest(PLAYABLE_SELECTOR) : null;
      if (playable && playable !== lastHoverTarget) {
        playSfx('hover');
      }
      lastHoverTarget = playable;

      wakeLoop();
    };

    const onPointerDown = (e: PointerEvent | MouseEvent) => {
      unlockSfx();
      const target = e.target instanceof Element ? e.target : null;
      const sound = soundForElement(target);
      playSfx(sound);

      const isStrong = sound === 'open' || sound === 'launch';

      if ('pointerType' in e && e.pointerType === 'touch') {
        spawnTouchEffect(e.clientX, e.clientY, isStrong);
      } else {
        isMouseDown = true;
        if (ring) ring.dataset.down = 'true';
        if (dot) dot.dataset.down = 'true';
        spawnTouchEffect(e.clientX, e.clientY, false);
        wakeLoop();
      }
    };

    const onPointerUp = (e: PointerEvent | MouseEvent) => {
      if ('pointerType' in e && e.pointerType === 'touch') return;
      isMouseDown = false;
      if (ring) ring.dataset.down = 'false';
      if (dot) dot.dataset.down = 'false';
    };

    const onMouseLeave = () => {
      isVisible = false;
      document.body.classList.remove('cyber-cursor-enabled');
      dot?.classList.add('cyber-cursor-hidden');
      ring?.classList.add('cyber-cursor-hidden');
    };

    const onMouseEnter = () => {
      if (!isTouchOnly) {
        isVisible = true;
        document.body.classList.add('cyber-cursor-enabled');
        dot?.classList.remove('cyber-cursor-hidden');
        ring?.classList.remove('cyber-cursor-hidden');
      }
    };

    window.addEventListener('pointermove', onPointerMove as EventListener, { passive: true });
    window.addEventListener('pointerdown', onPointerDown as EventListener, { passive: true });
    window.addEventListener('pointerup', onPointerUp as EventListener, { passive: true });
    window.addEventListener('mousemove', onPointerMove as EventListener, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (idleTimer) clearTimeout(idleTimer);
      document.body.classList.remove('cyber-cursor-enabled');
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('pointerdown', onPointerDown as EventListener);
      window.removeEventListener('pointerup', onPointerUp as EventListener);
      window.removeEventListener('mousemove', onPointerMove as EventListener);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="cyber-cursor-container" aria-hidden="true">
        <div ref={dotRef} className="cyber-cursor-dot cyber-cursor-hidden" />
        <div ref={ringRef} className="cyber-cursor-ring cyber-cursor-hidden" />
      </div>
      <div ref={fxLayerRef} className="fx-layer" aria-hidden="true" />
    </>
  );
}
