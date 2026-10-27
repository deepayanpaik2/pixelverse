'use client';

import React, { useMemo } from 'react';
import { AvatarConfig } from '@/lib/avatar-builder/types';
import { renderAvatarSvg } from '@/lib/avatar-builder/renderer';

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  glow?: boolean;
}

export function AvatarPreview({ config, size = 320, className = '', glow = true }: AvatarPreviewProps) {
  const svgString = useMemo(() => {
    return renderAvatarSvg(config, size);
  }, [config, size]);

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 3D Ambient Halo Glow matching avatar accents */}
      {glow && (
        <div
          className="absolute -inset-3 rounded-full blur-2xl opacity-40 transition-all duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, rgba(244,63,94,0.4) 60%, transparent 80%)',
          }}
        />
      )}

      {/* Embedded SVG Canvas */}
      <div
        className="relative z-10 w-full h-full rounded-[32px] overflow-hidden border border-white/20 shadow-2xl drop-shadow-xl"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    </div>
  );
}
