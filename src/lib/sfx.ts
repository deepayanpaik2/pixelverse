/**
 * Sound effects synthesized in the browser via Web Audio API.
 * Glass bells and soft ticks on a gentle pentatonic scale, with a short shimmering echo.
 *
 *   tap     any press            hover   pointer lands on something playable
 *   open    a game tile is opened   launch  the Play button: a rising chime + whoosh
 *   like    favourite / rating   toggle  switches and chips
 */
export type SfxName = 'tap' | 'soft' | 'hover' | 'open' | 'launch' | 'like' | 'toggle';

const KEY = 'pv-sfx';
const EVENT = 'pv-sfx-change';

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;   // dry
let echo: GainNode | null = null;  // send into the shimmer delay
const lastPlayed: Record<string, number> = {};

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
  );
}

export function isSfxOn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = window.localStorage.getItem(KEY);
    if (val !== null) return val === 'on';
    // By default on mobile devices: sound is muted to prevent heating and click lag.
    // However, users can freely enable it anytime using the Sound Toggle option!
    // On PC: sound is enabled by default.
    return !isMobileDevice();
  } catch {
    return !isMobileDevice();
  }
}

export function setSfxOn(on: boolean) {
  try { window.localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
  window.dispatchEvent(new Event(EVENT));
  if (on) playSfx('toggle');
}

export function onSfxChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb); };
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.6;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(master);

    // shimmer echo: a short feedback delay, darkened so repeats melt away
    const delay = ctx.createDelay(0.6); delay.delayTime.value = 0.17;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3200;
    echo = ctx.createGain(); echo.gain.value = 1;
    echo.connect(delay); delay.connect(tone); tone.connect(fb); fb.connect(delay); tone.connect(master);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from the first user gesture so the browser lets sound play. */
export function unlockSfx() {
  if (!isSfxOn()) return;
  audio();
}

function bell(freq: number, at: number, dur: number, vol: number, send = 0.45) {
  const c = ctx!; if (!bus || !echo) return;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  const parts: [number, number][] = [[1, 1], [2.01, 0.32], [3.98, 0.12]];
  for (const [mult, amp] of parts) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mult;
    const pg = c.createGain(); pg.gain.value = amp;
    o.connect(pg); pg.connect(g);
    o.start(at); o.stop(at + dur + 0.05);
  }
  g.connect(bus);
  const s = c.createGain(); s.gain.value = send; g.connect(s); s.connect(echo);
}

function tick(freq: number, at: number, dur: number, vol: number) {
  const c = ctx!; if (!bus) return;
  const o = c.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(freq * 1.5, at);
  o.frequency.exponentialRampToValueAtTime(freq, at + dur * 0.6);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(bus);
  o.start(at); o.stop(at + dur + 0.03);
}

function whoosh(at: number, dur: number, vol: number) {
  const c = ctx!; if (!bus) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(380, at);
  bp.frequency.exponentialRampToValueAtTime(3400, at + dur * 0.8);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(bp); bp.connect(g); g.connect(bus);
  src.start(at); src.stop(at + dur);
}

// C major pentatonic across two octaves
const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1568 };

const MIN_GAP: Record<SfxName, number> = { tap: 30, soft: 30, hover: 70, open: 120, launch: 400, like: 120, toggle: 80 };

export function playSfx(name: SfxName) {
  if (!isSfxOn()) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (now - (lastPlayed[name] || 0) < MIN_GAP[name]) return;
  lastPlayed[name] = now;
  const c = audio(); if (!c) return;
  const t = c.currentTime + 0.005;

  switch (name) {
    case 'hover':
      bell(N.G6, t, 0.09, 0.012, 0.15);
      break;
    case 'soft':
      tick(520, t, 0.05, 0.03);
      break;
    case 'tap':
      tick(760, t, 0.06, 0.07);
      bell(N.E6, t + 0.004, 0.22, 0.035, 0.35);
      break;
    case 'toggle':
      bell(N.C6, t, 0.2, 0.06);
      bell(N.G6, t + 0.07, 0.3, 0.05);
      break;
    case 'open':
      tick(620, t, 0.05, 0.06);
      bell(N.E5, t, 0.32, 0.07);
      bell(N.C6, t + 0.075, 0.5, 0.06, 0.6);
      break;
    case 'like':
      bell(N.A5, t, 0.28, 0.07);
      bell(N.E6, t + 0.08, 0.4, 0.065, 0.6);
      bell(N.G6, t + 0.16, 0.55, 0.05, 0.7);
      break;
    case 'launch': {
      whoosh(t, 0.7, 0.09);
      const sweep = c.createOscillator(); sweep.type = 'sine';
      sweep.frequency.setValueAtTime(110, t); sweep.frequency.exponentialRampToValueAtTime(330, t + 0.55);
      const sg = c.createGain();
      sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.09, t + 0.2); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      sweep.connect(sg); sg.connect(bus!); sweep.start(t); sweep.stop(t + 0.75);
      [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => bell(f, t + 0.12 + i * 0.075, 0.7 - i * 0.04, 0.06, 0.65));
      break;
    }
  }
}
