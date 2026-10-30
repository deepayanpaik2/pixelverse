'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let done = false;
    const go = (path: string) => {
      if (!done) {
        done = true;
        setStatus('success');
        setTimeout(() => router.replace(path), 400);
      }
    };

    // Check for PKCE auth code in URL query params (Google OAuth callback)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const err = params.get('error_description') || params.get('error');
      const nextParam = params.get('next');
      const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

      if (err) {
        setStatus('error');
        const isCancelled =
          err.toLowerCase().includes('access_denied') ||
          err.toLowerCase().includes('denied') ||
          err.toLowerCase().includes('cancel');
        const friendly = isCancelled ? 'Google Sign-In was cancelled.' : decodeURIComponent(err);
        setErrorMsg(friendly);
        setTimeout(() => router.replace(`/auth/sign-in?error=${encodeURIComponent(friendly)}`), 2500);
        return;
      }

      if (code) {
        supabase.auth
          .exchangeCodeForSession(code)
          .then(async ({ data, error }) => {
            if (error) {
              console.warn('[auth/callback] exchangeCodeForSession warning:', error.message);
              // Fallback to getSession in case listener already grabbed it
              const { data: sessData } = await supabase.auth.getSession();
              if (sessData?.session) {
                go(safeNext);
              } else {
                setStatus('error');
                setErrorMsg(error.message);
                setTimeout(() => router.replace(`/auth/sign-in?error=${encodeURIComponent(error.message)}`), 3000);
              }
            } else if (data?.session) {
              go(safeNext);
            }
          })
          .catch((e) => {
            console.error('[auth/callback] exception:', e);
            setStatus('error');
            setErrorMsg('Authentication error occurred.');
            setTimeout(() => router.replace('/auth/sign-in'), 2500);
          });
      }
    }

    // Listen for Supabase session / auth state change
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const nextParam = params?.get('next');
        const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
        go(safeNext);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const nextParam = params?.get('next');
        const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
        go(safeNext);
      }
    });

    const timeout = setTimeout(() => {
      if (!done) {
        router.replace('/auth/sign-in');
      }
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300 p-4">
      {status === 'verifying' && (
        <div className="glass-panel p-8 rounded-2xl border border-arcade-border text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 blur-xl animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)]">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white">Verifying Account</h2>
            <p className="text-xs text-slate-400 mt-1">Connecting your profile to Pixelverse…</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white">Authentication Successful!</h2>
            <p className="text-xs text-emerald-300 mt-1">Welcome to Pixelverse!</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="relative w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-300">
              <AlertCircle className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white">Sign-In Notice</h2>
            <p className="text-xs text-rose-300 mt-1">{errorMsg || 'Could not verify session. Redirecting...'}</p>
          </div>
          <button
            type="button"
            onClick={() => router.replace('/auth/sign-in')}
            className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      )}
    </div>
  );
}
