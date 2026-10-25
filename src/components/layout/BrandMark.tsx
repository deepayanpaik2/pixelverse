import React from 'react';

/** The Pixelverse mark: an illuminated gaming opal cut from 3D pixel facets. */
export function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} drop-shadow-[0_0_14px_var(--accent-glow)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pv-gem" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent, #00f3ff)" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent-secondary, #c084fc)" />
        </linearGradient>
        <filter id="pv-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Gem Base Facets */}
      <path d="M20 2 36 14 20 38 4 14Z" fill="url(#pv-gem)" />
      {/* Top Refraction Crown */}
      <path d="M20 2 28 14H12Z" fill="#ffffff" opacity="0.65" />
      {/* 3D Depth Shadow Facet */}
      <path d="M4 14h32L20 38Z" fill="#04060c" opacity="0.25" />
      {/* Play Icon Engraved in Gem Heart */}
      <path d="M17.5 17v9l7.5-4.5Z" fill="#06070b" />
    </svg>
  );
}
