'use client';

import React, { useMemo, useState } from 'react';
import { coverDataUri, isPhoto, styleFor } from '@/lib/cover';

/**
 * Fills its parent completely. Uses the player's photo when there is one (and falls back to a
 * generated cover if the photo fails to load), then fades into the card below it.
 */
export function ProfileCover({ bannerUrl, seed, className = '' }: { bannerUrl?: string; seed: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const generated = useMemo(() => coverDataUri(styleFor(bannerUrl, seed), seed), [bannerUrl, seed]);
  const src = isPhoto(bannerUrl) && !broken ? (bannerUrl as string) : generated;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />
      {/* Ambient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}
