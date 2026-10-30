'use client';

import { useEffect } from 'react';

export function PerformanceMode() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as any;
    const isLowCore = nav.hardwareConcurrency && nav.hardwareConcurrency <= 4;
    const isLowMemory = nav.deviceMemory && nav.deviceMemory <= 4;

    if (isLowCore || isLowMemory) {
      document.documentElement.setAttribute('data-fx', 'low');
      return;
    }

    // Measure FPS over initial 2 seconds to catch real runtime frame drops
    let frames = 0;
    const start = performance.now();
    let rafId: number;

    const checkFps = (time: number) => {
      frames++;
      const elapsed = time - start;
      if (elapsed < 2000) {
        rafId = requestAnimationFrame(checkFps);
      } else {
        const fps = (frames / elapsed) * 1000;
        if (fps < 40) {
          document.documentElement.setAttribute('data-fx', 'low');
        }
      }
    };

    rafId = requestAnimationFrame(checkFps);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return null;
}
