/**
 * Shared singleton AudioContext across SFX, Voice Engine, and Party RTC.
 * Automatically resumed on first user gesture (pointerdown / keydown / click).
 */

declare global {
  interface Window {
    __PIXELVERSE_AUDIO_CTX__?: AudioContext;
  }
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!window.__PIXELVERSE_AUDIO_CTX__) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    window.__PIXELVERSE_AUDIO_CTX__ = new AC();
  }

  const ctx = window.__PIXELVERSE_AUDIO_CTX__;
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

if (typeof window !== 'undefined') {
  const resume = () => {
    const ctx = window.__PIXELVERSE_AUDIO_CTX__;
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('touchstart', resume);
    }
  };

  window.addEventListener('pointerdown', resume, { passive: true });
  window.addEventListener('keydown', resume, { passive: true });
  window.addEventListener('touchstart', resume, { passive: true });
}
