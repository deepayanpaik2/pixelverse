'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  XCircle,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { SignupStepper } from '@/components/profile/SignupStepper';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { AvatarStudio } from '@/components/avatar/AvatarStudio';
import { CATEGORIES } from '@/lib/games';
import { DEFAULT_AVATAR } from '@/lib/avatar';
import { playSfx } from '@/lib/sfx';

const BIO_MAX = 160;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, updateProfile, uploadAvatar, checkUsernameAvailable } = useAuth();

  const [step, setStep] = useState<2 | 3>(2);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [nameState, setNameState] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // prefill from the account that was just created
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }
    if (!hydrated) {
      setUsername(user.username);
      setDisplayName(user.display_name || user.username);
      setBio(user.bio || '');
      setCats(user.favorite_categories || []);
      setPreview(user.avatar_url || DEFAULT_AVATAR(user.username));
      setHydrated(true);
    }
  }, [user, isLoading, hydrated, router]);

  const cleanName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

  useEffect(() => {
    if (!hydrated) return;
    if (cleanName.length < 3) {
      setNameState(cleanName ? 'invalid' : 'idle');
      return;
    }
    setNameState('checking');
    const t = setTimeout(async () => {
      setNameState((await checkUsernameAvailable(cleanName)) ? 'ok' : 'taken');
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanName, hydrated]);

  const toggleCat = (name: string) =>
    setCats((c) =>
      c.includes(name) ? c.filter((x) => x !== name) : c.length >= 5 ? c : [...c, name]
    );

  const handleAvatarSavedInStudio = (dataUrl: string) => {
    playSfx('launch');
    setGeneratedUrl(dataUrl);
    setPreview(dataUrl);
    setFile(null);
    setStep(3);
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    if (nameState === 'taken' || cleanName.length < 3)
      return setError('Pick a free username (3-20 characters).');
    if (!displayName.trim()) return setError('Add a display name.');

    setSaving(true);
    let avatarUrl = generatedUrl || preview || user.avatar_url || DEFAULT_AVATAR(cleanName);

    if (file) {
      const up = await uploadAvatar(file);
      if (!up.success) {
        setSaving(false);
        return setError(up.error || 'Upload failed.');
      }
      avatarUrl = up.url!;
    }

    const res = await updateProfile({
      username: cleanName,
      display_name: displayName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
      favorite_categories: cats,
      status: 'online',
      profile_completed: true,
    });
    setSaving(false);
    if (!res.success) return setError(res.error || 'Could not save your profile.');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-arcade-champagne" />
      </div>
    );
  }

  const inputCls =
    'w-full bg-arcade-midnight border border-arcade-border rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne focus:shadow-champagne-glow transition-all';

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-start sm:items-center justify-center p-2 sm:p-4 py-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl glass-panel rounded-3xl border border-arcade-border shadow-2xl p-4 sm:p-8 space-y-6"
      >
        <SignupStepper step={step} />

        <AnimatePresence mode="wait">
          {step === 2 ? (
            /* Avatar customizer */
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/40 text-[11px] font-black text-pink-300 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Character Studio
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Create & Style Your Avatar
                </h1>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Pick your legendary Roblox & Cyberpunk outfit, hairstyle, skins, and back gear — 100% free! You can customize anytime.
                </p>
              </div>

              {/* Interactive Avatar Studio */}
              <div className="glass-panel rounded-2xl p-3 sm:p-6 border border-white/10 bg-black/40">
                <AvatarStudio
                  onSave={handleAvatarSavedInStudio}
                  saveButtonText="Save Look & Continue to Profile →"
                />
              </div>

              {/* Bottom Quick Skip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
                <span>Want to use a basic avatar or upload your photo instead?</span>
                <button
                  type="button"
                  onClick={() => {
                    playSfx('tap');
                    setStep(3);
                  }}
                  className="text-[var(--accent)] hover:underline font-bold flex items-center gap-1.5"
                >
                  <span>Skip to Profile Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Profile details */
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Complete Your Player Profile
                </h1>
                <p className="text-xs text-slate-400">
                  This is how friends and rivals will see you. You can change everything later in Settings.
                </p>
              </div>

              <form
                onSubmit={finish}
                className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 text-xs"
              >
                <div className="space-y-5 order-2 lg:order-1">
                  {/* Step switch button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx('tap');
                        setStep(2);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 hover:border-[var(--accent)] text-slate-300 hover:text-white font-bold transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Back to Avatar Studio</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                          @
                        </span>
                        <input
                          value={username}
                          maxLength={20}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`${inputCls} pl-8 pr-9`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {nameState === 'checking' && (
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          )}
                          {nameState === 'ok' && (
                            <CheckCircle2 className="w-4 h-4 text-arcade-sage" />
                          )}
                          {(nameState === 'taken' || nameState === 'invalid') && (
                            <XCircle className="w-4 h-4 text-arcade-rose" />
                          )}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-[10px] ${
                          nameState === 'taken' || nameState === 'invalid'
                            ? 'text-arcade-rose'
                            : 'text-slate-500'
                        }`}
                      >
                        {nameState === 'taken'
                          ? 'Already taken.'
                          : nameState === 'invalid'
                          ? 'At least 3 characters.'
                          : 'Friends find you by this name.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Display Name</label>
                      <input
                        value={displayName}
                        maxLength={32}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-slate-300 font-bold">About you</label>
                      <span className="text-[10px] text-slate-500">
                        {bio.length}/{BIO_MAX}
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={bio}
                      maxLength={BIO_MAX}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Speedrunner, 2048 grinder, always up for a co-op match..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-slate-300 font-bold">Favourite game types</label>
                      <span className="text-[10px] text-slate-500">pick up to 5</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => {
                        const on = cats.includes(c.name);
                        return (
                          <motion.button
                            key={c.id}
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={() => toggleCat(c.name)}
                            className={`px-3 py-1.5 rounded-full border font-bold flex items-center gap-1 transition-colors ${
                              on
                                ? 'bg-arcade-champagne/15 border-arcade-champagne text-arcade-champagne'
                                : 'bg-arcade-midnight border-arcade-border text-slate-400 hover:text-white'
                            }`}
                          >
                            {on && <Check className="w-3 h-3" />} {c.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Custom Photo Upload toggle */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>Alternative: Upload Custom Photo</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                        className="text-[var(--accent)] font-bold text-[11px] hover:underline"
                      >
                        {showPhotoUpload ? 'Hide Uploader' : 'Show Uploader'}
                      </button>
                    </div>

                    {showPhotoUpload && (
                      <div className="pt-2 border-t border-white/10">
                        <AvatarPicker
                          preview={preview}
                          seed={cleanName}
                          onError={setError}
                          onFile={(f, url) => {
                            setFile(f);
                            setGeneratedUrl(null);
                            setPreview(url);
                          }}
                          onGenerated={(url) => {
                            setFile(null);
                            setGeneratedUrl(url);
                            setPreview(url);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-arcade-rose/15 border border-arcade-rose/30 text-arcade-rose font-semibold"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={saving || nameState === 'taken'}
                    className="w-full sm:w-auto sm:min-w-[220px] px-6 py-3.5 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold shadow-champagne-glow hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        Enter Pixelverse <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Right Column: Live Profile Identity Card */}
                <aside className="order-1 lg:order-2 flex flex-col items-center gap-4">
                  <div className="w-full rounded-2xl border border-arcade-border bg-arcade-midnight/90 overflow-hidden shadow-xl">
                    <div className="h-16 bg-gradient-to-r from-arcade-champagne/30 via-arcade-orchid/30 to-arcade-rose/30 relative">
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-full border border-white/20">
                        PREVIEW
                      </span>
                    </div>
                    <div className="px-5 pb-5 -mt-8 flex flex-col items-center text-center">
                      <div className="relative group">
                        <img
                          src={preview || DEFAULT_AVATAR(cleanName)}
                          alt=""
                          className="w-20 h-20 rounded-2xl object-cover border-4 border-arcade-midnight shadow-2xl bg-black"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            playSfx('tap');
                            setStep(2);
                          }}
                          className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          title="Edit in Avatar Studio"
                        >
                          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                        </button>
                      </div>

                      <div className="mt-3 font-extrabold text-white text-base truncate max-w-full">
                        {displayName || 'Your Display Name'}
                      </div>
                      <div className="text-xs text-arcade-champagne font-mono font-bold">
                        @{cleanName || 'username'}
                      </div>
                      <p className="mt-2 text-xs text-slate-300 line-clamp-3 min-h-[2.4em] leading-relaxed">
                        {bio || 'Your bio will appear here to friends and rivals.'}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {cats.length > 0 ? (
                          cats.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="px-2.5 py-0.5 rounded-full bg-arcade-surface text-[10px] text-slate-300 font-bold border border-white/10"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No games picked yet</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playSfx('tap');
                          setStep(2);
                        }}
                        className="mt-4 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>Edit Avatar in Studio</span>
                      </button>
                    </div>
                  </div>
                </aside>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
