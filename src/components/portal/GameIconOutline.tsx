'use client';

import React from 'react';

export interface OutlineTheme {
  id: string;
  name: string;
  accentHex: string;
  accentGlow: string;
  borderClass: string;
  hoverBorderClass: string;
  glowShadowClass: string;
  tileHoverBorder: string;
  renderCorners: () => React.ReactNode;
}

export const OUTLINE_THEMES: OutlineTheme[] = [
  // 1. CYBER TECH (Neon Cyan / HUD crosshairs)
  {
    id: 'cyber',
    name: 'Cyber Tech',
    accentHex: '#00f3ff',
    accentGlow: 'rgba(0, 243, 255, 0.45)',
    borderClass: 'border-cyan-500/35',
    hoverBorderClass: 'group-hover:border-cyan-400',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(0,243,255,0.4)]',
    tileHoverBorder: 'hover:border-cyan-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left HUD Bracket */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]" viewBox="0 0 14 14" fill="none">
            <path d="M1 9V3C1 1.89543 1.89543 1 3 1H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="3" cy="3" r="1" fill="#00f3ff" />
          </svg>
        </div>
        {/* Top-Right HUD Bracket */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]" viewBox="0 0 14 14" fill="none">
            <path d="M5 1H11C12.1046 1 13 1.89543 13 3V9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="11" cy="3" r="1" fill="#00f3ff" />
          </svg>
        </div>
        {/* Bottom-Left HUD Bracket */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]" viewBox="0 0 14 14" fill="none">
            <path d="M1 5V11C1 12.1046 1.89543 13 3 13H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="3" cy="11" r="1" fill="#00f3ff" />
          </svg>
        </div>
        {/* Bottom-Right HUD Bracket */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]" viewBox="0 0 14 14" fill="none">
            <path d="M5 13H11C12.1046 13 13 12.1046 13 11V5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="11" cy="11" r="1" fill="#00f3ff" />
          </svg>
        </div>
        {/* Micro Tech Center Ticks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-cyan-400/80 rounded-full shadow-[0_0_6px_#00f3ff]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-cyan-500/60 rounded-full" />
      </>
    ),
  },

  // 2. PHOENIX EMBER (Volcanic Crimson & Golden Flame)
  {
    id: 'ember',
    name: 'Phoenix Ember',
    accentHex: '#ff3366',
    accentGlow: 'rgba(255, 51, 102, 0.45)',
    borderClass: 'border-rose-500/35',
    hoverBorderClass: 'group-hover:border-amber-400',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(255,51,102,0.4)]',
    tileHoverBorder: 'hover:border-rose-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Flame Chamfer */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-rose-400 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_4px_#ff3366]" viewBox="0 0 14 14" fill="none">
            <path d="M1 8L8 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 3L3 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="5" cy="5" r="1" fill="#fbbf24" />
          </svg>
        </div>
        {/* Top-Right Flame Chamfer */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-rose-400 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_4px_#ff3366]" viewBox="0 0 14 14" fill="none">
            <path d="M6 1L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 1L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="9" cy="5" r="1" fill="#fbbf24" />
          </svg>
        </div>
        {/* Bottom-Left Flame Chamfer */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-rose-400 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_4px_#ff3366]" viewBox="0 0 14 14" fill="none">
            <path d="M1 6L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 11L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="5" cy="9" r="1" fill="#fbbf24" />
          </svg>
        </div>
        {/* Bottom-Right Flame Chamfer */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-rose-400 group-hover:text-amber-400 transition-colors drop-shadow-[0_0_4px_#ff3366]" viewBox="0 0 14 14" fill="none">
            <path d="M6 13L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 13L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="9" cy="9" r="1" fill="#fbbf24" />
          </svg>
        </div>
        {/* Dual Ember Notches */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 rounded-full shadow-[0_0_6px_#f59e0b]" />
      </>
    ),
  },

  // 3. ARCANE PRISM (Cosmic Amethyst & Iridescent Diamonds)
  {
    id: 'prism',
    name: 'Arcane Prism',
    accentHex: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.45)',
    borderClass: 'border-purple-500/35',
    hoverBorderClass: 'group-hover:border-fuchsia-400',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(192,132,252,0.4)]',
    tileHoverBorder: 'hover:border-fuchsia-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Gem */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-colors drop-shadow-[0_0_4px_#c084fc]" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12 7L7 13L2 7Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="1" fill="#ffffff" />
          </svg>
        </div>
        {/* Top-Right Gem */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-colors drop-shadow-[0_0_4px_#c084fc]" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12 7L7 13L2 7Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="1" fill="#ffffff" />
          </svg>
        </div>
        {/* Bottom-Left Gem */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-colors drop-shadow-[0_0_4px_#c084fc]" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12 7L7 13L2 7Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="1" fill="#ffffff" />
          </svg>
        </div>
        {/* Bottom-Right Gem */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-colors drop-shadow-[0_0_4px_#c084fc]" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12 7L7 13L2 7Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="1" fill="#ffffff" />
          </svg>
        </div>
        {/* Center Floating Arcane Rhombus */}
        <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-fuchsia-400 border border-white/70 shadow-[0_0_8px_#d946ef]" />
      </>
    ),
  },

  // 4. MATRIX HEX (Emerald Green & Circuit Micro-Steps)
  {
    id: 'matrix',
    name: 'Matrix Hex',
    accentHex: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    borderClass: 'border-emerald-500/35',
    hoverBorderClass: 'group-hover:border-emerald-300',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(16,185,129,0.4)]',
    tileHoverBorder: 'hover:border-emerald-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Stepped Circuit */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_#10b981]" viewBox="0 0 14 14" fill="none">
            <path d="M1 10V4H4V1H10" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="2" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {/* Top-Right Stepped Circuit */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_#10b981]" viewBox="0 0 14 14" fill="none">
            <path d="M13 10V4H10V1H4" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="2" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {/* Bottom-Left Stepped Circuit */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_#10b981]" viewBox="0 0 14 14" fill="none">
            <path d="M1 4V10H4V13H10" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="10" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {/* Bottom-Right Stepped Circuit */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_#10b981]" viewBox="0 0 14 14" fill="none">
            <path d="M13 4V10H10V13H4" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="10" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {/* Side Circuit Nodes */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[2px] h-3 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[2px] h-3 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
      </>
    ),
  },

  // 5. SOVEREIGN GOLD (Imperial Aureate Chevrons & Golden Studs)
  {
    id: 'gold',
    name: 'Sovereign Gold',
    accentHex: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    borderClass: 'border-amber-500/35',
    hoverBorderClass: 'group-hover:border-yellow-300',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(245,158,11,0.45)]',
    tileHoverBorder: 'hover:border-amber-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Chevron & Stud */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_4px_#f59e0b]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7V2C1 1.44772 1.44772 1 2 1H7" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="6" r="1.5" fill="#fde047" />
          </svg>
        </div>
        {/* Top-Right Chevron & Stud */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_4px_#f59e0b]" viewBox="0 0 14 14" fill="none">
            <path d="M7 1H12C12.5523 1 13 1.44772 13 2V7" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="6" r="1.5" fill="#fde047" />
          </svg>
        </div>
        {/* Bottom-Left Chevron & Stud */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_4px_#f59e0b]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7V12C1 12.5523 1.44772 13 2 13H7" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="8" r="1.5" fill="#fde047" />
          </svg>
        </div>
        {/* Bottom-Right Chevron & Stud */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_4px_#f59e0b]" viewBox="0 0 14 14" fill="none">
            <path d="M7 13H12C12.5523 13 13 12.5523 13 12V7" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="8" r="1.5" fill="#fde047" />
          </svg>
        </div>
        {/* Gold Crown Micro Crest */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_4px_#fde047]" />
          <div className="w-4 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-full" />
          <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_4px_#fde047]" />
        </div>
      </>
    ),
  },

  // 6. HYPERDRIVE AZURE (Cobalt Blue & Aerodynamic Speed Hashes)
  {
    id: 'azure',
    name: 'Hyperdrive Azure',
    accentHex: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    borderClass: 'border-sky-500/35',
    hoverBorderClass: 'group-hover:border-sky-300',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(56,189,248,0.4)]',
    tileHoverBorder: 'hover:border-sky-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Speed Hashes */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_4px_#38bdf8]" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L8 2M6 12L12 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        {/* Top-Right Speed Hashes */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_4px_#38bdf8]" viewBox="0 0 14 14" fill="none">
            <path d="M12 12L6 2M8 12L2 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        {/* Bottom-Left Speed Hashes */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_4px_#38bdf8]" viewBox="0 0 14 14" fill="none">
            <path d="M12 12L6 2M8 12L2 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        {/* Bottom-Right Speed Hashes */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_4px_#38bdf8]" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L8 2M6 12L12 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        {/* Dual Velocity Strips */}
        <div className="absolute top-0 right-4 w-5 h-[2px] bg-sky-400 rounded-full shadow-[0_0_6px_#38bdf8]" />
        <div className="absolute bottom-0 left-4 w-5 h-[2px] bg-sky-400 rounded-full shadow-[0_0_6px_#38bdf8]" />
      </>
    ),
  },

  // 7. SYNTHWAVE SUNSET (Neon Magenta / Retro Wave Stripes)
  {
    id: 'synthwave',
    name: 'Synthwave Sunset',
    accentHex: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.45)',
    borderClass: 'border-pink-500/35',
    hoverBorderClass: 'group-hover:border-orange-400',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(236,72,153,0.4)]',
    tileHoverBorder: 'hover:border-pink-400/80',
    renderCorners: () => (
      <>
        {/* Top-Left Triple Stair */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-pink-400 group-hover:text-orange-400 transition-colors drop-shadow-[0_0_4px_#ec4899]" viewBox="0 0 14 14" fill="none">
            <path d="M1 4H4V1" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M1 8H8V1" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M1 12H12V1" stroke="#fb923c" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Top-Right Triple Stair */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-pink-400 group-hover:text-orange-400 transition-colors drop-shadow-[0_0_4px_#ec4899]" viewBox="0 0 14 14" fill="none">
            <path d="M13 4H10V1" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M13 8H6V1" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M13 12H2V1" stroke="#fb923c" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Bottom-Left Triple Stair */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-pink-400 group-hover:text-orange-400 transition-colors drop-shadow-[0_0_4px_#ec4899]" viewBox="0 0 14 14" fill="none">
            <path d="M1 10H4V13" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M1 6H8V13" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M1 2H12V13" stroke="#fb923c" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Bottom-Right Triple Stair */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-pink-400 group-hover:text-orange-400 transition-colors drop-shadow-[0_0_4px_#ec4899]" viewBox="0 0 14 14" fill="none">
            <path d="M13 10H10V13" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M13 6H6V13" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M13 2H2V13" stroke="#fb923c" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Sunset Horizon Line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 rounded-full shadow-[0_0_6px_#fb923c]" />
      </>
    ),
  },

  // 8. QUANTUM FROST (Glacial Crystal / Platinum Sparkle)
  {
    id: 'frost',
    name: 'Quantum Frost',
    accentHex: '#2dd4bf',
    accentGlow: 'rgba(45, 212, 191, 0.45)',
    borderClass: 'border-teal-400/35',
    hoverBorderClass: 'group-hover:border-cyan-200',
    glowShadowClass: 'group-hover:shadow-[0_0_22px_rgba(45,212,191,0.4)]',
    tileHoverBorder: 'hover:border-teal-300/80',
    renderCorners: () => (
      <>
        {/* Top-Left Crystal */}
        <div className="absolute top-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-teal-300 drop-shadow-[0_0_4px_#2dd4bf]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M7 1V13M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
        {/* Top-Right Crystal */}
        <div className="absolute top-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-teal-300 drop-shadow-[0_0_4px_#2dd4bf]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M7 1V13M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
        {/* Bottom-Left Crystal */}
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-teal-300 drop-shadow-[0_0_4px_#2dd4bf]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M7 1V13M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
        {/* Bottom-Right Crystal */}
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-teal-300 drop-shadow-[0_0_4px_#2dd4bf]" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M7 1V13M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
        {/* Ice Shard Center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-teal-300 via-cyan-100 to-teal-300 rounded-full shadow-[0_0_6px_#2dd4bf]" />
      </>
    ),
  },
];

/**
 * Deterministically get an outline theme for any game so every icon has a
 * persistent, distinct, and creative frame outline.
 */
export function getOutlineTheme(gameId: string, category: string = ''): OutlineTheme {
  let hash = 0;
  const str = gameId + ':' + category;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % OUTLINE_THEMES.length;
  return OUTLINE_THEMES[index];
}

interface GameIconOutlineProps {
  theme: OutlineTheme;
}

export function GameIconOutline({ theme }: GameIconOutlineProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none rounded-[1.1rem] overflow-hidden">
      {/* Dynamic Theme Corner Ornaments */}
      {theme.renderCorners()}

      {/* Subtle Specular Top Arc Reflection */}
      <div className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
    </div>
  );
}
