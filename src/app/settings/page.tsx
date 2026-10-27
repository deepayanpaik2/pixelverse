'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Volume2, 
  User, 
  Shield, 
  Sparkles, 
  Check,
  Eye,
  Lock,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { COVER_STYLES, coverDataUri, isPhoto } from '@/lib/cover';
import { playSfx } from '@/lib/sfx';

export default function SettingsPage() {
  const { user, preferences, updateProfile, updatePreferences } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
      banner_url: bannerUrl.trim() || undefined,
      status: status as any,
    });
    setSavedSuccess(true);
    playSfx('like');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const themes = [
    { id: 'cyberpunk', label: 'Cyberpunk 2077', primary: '#00f3ff', secondary: '#f43f5e', desc: 'Neon Cyan & Hyper Rose' },
    { id: 'synthwave', label: 'Outrun Synthwave', primary: '#ff2a85', secondary: '#00f5d4', desc: 'Retro Pink & Aquamarine' },
    { id: 'midnight-neon', label: 'Midnight Matrix', primary: '#00f0ff', secondary: '#6366f1', desc: 'Electric Azure & Indigo' },
    { id: 'sunset-orange', label: 'Solar Phoenix', primary: '#ff7b00', secondary: '#facc15', desc: 'Molten Flame & Warm Gold' },
    { id: 'forest-green', label: 'Emerald Matrix', primary: '#10b981', secondary: '#06b6d4', desc: 'Phosphor Jade & Bio Hacker' },
    { id: 'deep-purple', label: 'Arcane Void', primary: '#a855f7', secondary: '#ec4899', desc: 'Ethereal Violet & Fuchsia' },
    { id: 'bloodforge', label: 'Bloodforge Mecha', primary: '#ff1e42', secondary: '#ff7b00', desc: 'Crimson Plasma & Ember' },
    { id: 'dark', label: 'Opal Noir', primary: '#a9e9df', secondary: '#b9a8ff', desc: 'Deep Obsidian & Pearl Mint' },
    { id: 'light', label: 'Crystal Clean', primary: '#0284c7', secondary: '#8b5cf6', desc: 'Clean Bright Light' },
    { id: 'high-contrast', label: 'Ultra Contrast', primary: '#ffff00', secondary: '#ffffff', desc: 'Pure Cyber Yellow & Black' },
  ];

  const accents = [
    { id: 'cyan', label: 'Cyan', color: '#00f3ff' },
    { id: 'purple', label: 'Violet', color: '#c084fc' },
    { id: 'lime', label: 'Emerald', color: '#10b981' },
    { id: 'coral', label: 'Magenta', color: '#ff2a85' },
    { id: 'gold', label: 'Amber', color: '#f59e0b' },
    { id: 'sunset', label: 'Orange', color: '#ff7b00' },
    { id: 'forest', label: 'Lime', color: '#4ade80' },
    { id: 'crimson', label: 'Crimson', color: '#ff1e42' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 3D Header Cockpit */}
      <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="gaming-icon-box w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest uppercase">
                // SYSTEM PREFERENCES
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Settings & Themes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Customize visual aesthetics, 3D gaming theme engines, and player identity.
            </p>
          </div>
        </div>

        <Link
          href="/settings/privacy"
          onClick={() => playSfx('tap')}
          className="glass-chip flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black text-slate-200 hover:text-white transition-all self-start md:self-auto shadow-md"
        >
          <Lock className="w-4 h-4 text-[var(--accent)]" />
          <span>Privacy & Security</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Identity Editor */}
        <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 space-y-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
            <User className="w-4 h-4 text-[var(--accent)]" /> Player Profile Identity
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#060810]/80 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-bold">Avatar Image URL</label>
                <Link
                  href="/avatar"
                  className="inline-flex items-center gap-1.5 text-[11px] font-black text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize in Avatar Studio</span>
                </Link>
              </div>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-[#060810]/80 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Banner Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={isPhoto(bannerUrl) ? bannerUrl : ''}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-[#060810]/80 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Bio / Status Quote</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#060810]/80 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Online Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#060810]/80 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent)] transition-all font-semibold"
              >
                <option value="online">🟢 Online (Available)</option>
                <option value="idle">🟡 Idle (Away)</option>
                <option value="dnd">🔴 Do Not Disturb (Gaming)</option>
                <option value="offline">⚪ Invisible (Offline)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3">
              {savedSuccess ? (
                <span className="text-emerald-400 text-xs font-black flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4 stroke-[3]" /> Profile Saved Successfully!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="btn-gaming px-6 py-3 rounded-full font-black text-xs shadow-lg ml-auto"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Visual Themes & 3D Gaming System */}
        <div className="drawer-neon p-6 sm:p-8 rounded-[2rem] border border-white/15 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--accent)]" /> Visual Themes & 3D Modes
            </h2>
            <span className="text-[10px] font-mono text-[var(--accent)] font-bold">10 THEMES</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-300 uppercase tracking-wide">
              Active Gaming Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-none">
              {themes.map((t) => {
                const isActive = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      updatePreferences({ theme: t.id as any });
                      playSfx('launch');
                    }}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-[var(--accent)] bg-white/[0.08] text-white shadow-[0_0_16px_var(--accent-glow)] scale-[1.02]'
                        : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/30 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex -space-x-1.5 items-center">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: t.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: t.secondary }} />
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[var(--accent)] stroke-[3]" />}
                    </div>
                    <span className="text-xs font-black truncate">{t.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Accent Color Override */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <label className="block text-xs font-black text-slate-300 uppercase tracking-wide">
              Custom Accent Glow Override
            </label>
            <div className="grid grid-cols-4 gap-2">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    updatePreferences({ accent_color: a.id as any });
                    playSfx('toggle');
                  }}
                  className={`py-2 rounded-xl text-xs font-black capitalize transition-all border ${
                    preferences.accent_color === a.id
                      ? 'border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: `${a.color}25`, color: a.color }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Motion Toggles */}
          <div className="pt-4 border-t border-white/10 space-y-3.5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[var(--accent)]" /> Audio Effects & Interface SFX
              </span>
              <input
                type="checkbox"
                checked={preferences.sound_effects_enabled}
                onChange={(e) => {
                  updatePreferences({ sound_effects_enabled: e.target.checked });
                  playSfx('toggle');
                }}
                className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" /> Reduced Motion Animations
              </span>
              <input
                type="checkbox"
                checked={preferences.animation_intensity === 'reduced'}
                onChange={(e) => updatePreferences({ animation_intensity: e.target.checked ? 'reduced' : 'full' })}
                className="w-4 h-4 accent-[var(--accent-secondary)] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
