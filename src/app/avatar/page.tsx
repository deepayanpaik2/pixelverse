'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Gamepad2, ArrowLeft } from 'lucide-react';
import { AvatarStudio } from '@/components/avatar/AvatarStudio';
import { useAuth } from '@/features/auth/AuthContext';

export default function AvatarPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const handleSave = async (dataUrl: string) => {
    if (user) {
      await updateProfile({ avatar_url: dataUrl });
    } else {
      try {
        window.localStorage.setItem('pv_guest_avatar', dataUrl);
      } catch {}
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <Link
          href="/"
          className="flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arcade</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">Avatar Studio Live</span>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="glass-panel rounded-3xl p-4 sm:p-8 border border-white/15 shadow-2xl">
        <AvatarStudio
          onSave={handleSave}
          saveButtonText={user ? 'Equip to My Profile' : 'Save Avatar (Guest)'}
          isStandalonePage
        />
      </div>
    </div>
  );
}
