'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { playSfx } from '@/lib/sfx';
import { useAuth } from '@/features/auth/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedInUser, setSignedInUser] = useState<string | null>(null);

  // Prefetch home route immediately on mount so redirect is instant
  React.useEffect(() => {
    router.prefetch('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || signedInUser) return;
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await signIn(email, password);

    if (res.success) {
      const uname = email.split('@')[0];
      setSignedInUser(uname);
      playSfx('launch');
      // Snappy 450ms transition so user enjoys the sign-in confirmation animation
      setTimeout(() => {
        router.replace('/');
      }, 450);
    } else {
      setIsSubmitting(false);
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-arcade-border shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {signedInUser ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-90 duration-300">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.6)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                Signed In! <Sparkles className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Welcome back, <span className="text-arcade-champagne font-bold">@{signedInUser}</span>
              </p>
            </div>
            {/* Quick animated progress indicator */}
            <div className="w-48 mx-auto h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-arcade-champagne animate-pulse w-full" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Entering Pixelverse…</p>
          </div>
        ) : (
          <>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-arcade-champagne/10 border border-arcade-champagne/30 rounded-xl flex items-center justify-center text-arcade-champagne mb-2 shadow-champagne-glow">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to Pixelverse</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your arcade profile</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-arcade-rose/15 border border-arcade-rose/30 text-arcade-rose text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-arcade-midnight border border-arcade-border rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-bold">Password</label>
              <Link href="/auth/forgot-password" className="text-[11px] text-arcade-champagne hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-arcade-midnight border border-arcade-border rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-champagne"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-arcade-champagne text-arcade-dark font-extrabold text-xs shadow-champagne-glow hover:bg-white transition-colors flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Signing in...' : 'Enter Pixelverse'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-arcade-border text-center text-xs text-slate-400">
          New to Pixelverse?{' '}
          <Link href="/auth/sign-up" className="text-arcade-champagne font-bold hover:underline">
            Create an Account
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
