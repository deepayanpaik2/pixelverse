'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSfxOn, setSfxOn, onSfxChange } from '@/lib/sfx';

export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(isSfxOn());
    return onSfxChange(() => setOn(isSfxOn()));
  }, []);

  return (
    <button
      onClick={() => setSfxOn(!on)}
      data-sfx="soft"
      className="p-2 rounded-xl bg-arcade-surface border border-arcade-border text-slate-300 hover:text-arcade-champagne hover:border-arcade-champagne/60 transition-colors"
      title={on ? 'Mute sound effects' : 'Unmute sound effects'}
      aria-label={on ? 'Mute sound effects' : 'Turn on sound effects'}
      aria-pressed={on}
    >
      {on ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
