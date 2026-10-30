'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle2, XCircle, Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { SignupStepper } from '@/components/profile/SignupStepper';
import { playSfx } from '@/lib/sfx';

function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 14) score++;
  return score; // 0-4
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, checkUsernameAvailable } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [nameState, setNameState] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle');

  const cleanName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const strength = passwordStrength(password);

  useEffect(() => {
    if (!cleanName) { setNameState('idle'); return; }
    if (cleanName.length < 3) { setNameState('invalid'); return; }
    setNameState('checking');
    const t = setTimeout(async () => {
      const free = await checkUsernameAvailable(cleanName);
      setNameState(free ? 'ok' : 'taken');
    }, 400);
    return () => clearTimeout(t);
  }, [cleanName, checkUsernameAvailable]);

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMsg('');
    playSfx('launch');

    const res = await signInWithGoogle();
    if (!res.success) {
      setIsGoogleLoading(false);
      setErrorMsg(res.error || 'Failed to initialize Google Sign-In.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGoogleLoading) return;
    setErrorMsg('');
    if (nameState === 'taken') return setErrorMsg('That username is already taken.');
    if (cleanName.length < 3) return setErrorMsg('Username needs at least 3 characters.');
    if (password.length < 8) return setErrorMsg('Password needs at least 8 characters.');

    setIsSubmitting(true);
    const res = await signUp(email, password, cleanName, displayName.trim() || cleanName);
    setIsSubmitting(false);

    if (!res.success) return setErrorMsg(res.error || 'Failed to register account.');
    if (res.needsConfirmation) return setNeedsConfirmation(true);
    router.push('/onboarding');
  };

  const inputCls =
    'w-full bg-arcade-midnight border border-arcade-border rounded-xl py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-arcade-sage focus:shadow-sage-glow transition-all';

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-arcade-border shadow-2xl space-y-5"
      >
        <SignupStepper step={1} />

        <AnimatePresence mode="wait">
          {needsConfirmation ? (
            <m.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
              <div className="w-14 h-14 mx-auto bg-arcade-champagne/10 border border-arcade-champagne/30 rounded-2xl flex items-center justify-center text-arcade-champagne shadow-champagne-glow">
                <MailCheck className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black text-white">Check your inbox</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                We sent a confirmation link to <span className="text-white font-bold">{email}</span>.
                Open it and you will land straight on the profile-creation step.
              </p>
              <Link href="/auth/sign-in" className="inline-block text-xs text-arcade-champagne font-bold hover:underline">Back to sign in</Link>
            </m.div>
          ) : (
            <m.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-arcade-sage/10 border border-arcade-sage/30 rounded-xl flex items-center justify-center text-arcade-sage shadow-sage-glow">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white">Join Pixelverse</h1>
                <p className="text-xs text-slate-400">Choose your preferred sign-up method to get started</p>
              </div>

              {errorMsg && (
                <m.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg bg-arcade-rose/15 border border-arcade-rose/30 text-arcade-rose text-xs font-semibold leading-relaxed">
                  <p>{errorMsg}</p>
                  {errorMsg.includes('Supabase Dashboard') && (
                    <div className="mt-2 pt-2 border-t border-arcade-rose/20 flex justify-end">
                      <a
                        href="https://supabase.com/dashboard/project/qgbrheqyavqjmgvxjmeh/auth/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white bg-arcade-rose/40 hover:bg-arcade-rose/60 py-1 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        Open Supabase Providers Settings ➔
                      </a>
                    </div>
                  )}
                </m.div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                aria-label="Continue with Google"
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-slate-200 focus:outline-none focus:ring-2 focus:ring-arcade-sage focus:ring-offset-2 focus:ring-offset-arcade-midnight"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0c1020] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                  or register with email
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unique Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                    <input type="text" required value={username} maxLength={20} onChange={(e) => setUsername(e.target.value)}
                      placeholder="speedrunner99" autoComplete="username" className={`${inputCls} pl-8 pr-9`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {nameState === 'checking' && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                      {nameState === 'ok' && <CheckCircle2 className="w-4 h-4 text-arcade-sage" />}
                      {(nameState === 'taken' || nameState === 'invalid') && <XCircle className="w-4 h-4 text-arcade-rose" />}
                    </span>
                  </div>
                  <p className={`mt-1 text-[10px] ${nameState === 'taken' ? 'text-arcade-rose' : nameState === 'ok' ? 'text-arcade-sage' : 'text-slate-500'}`}>
                    {nameState === 'taken' ? 'Already taken. Try another.' : nameState === 'ok' ? `@${cleanName} is available` : 'Letters, numbers and _ only. 3-20 characters.'}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" required value={displayName} maxLength={32} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Speed Runner" className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="player@arcade.com" autoComplete="email" className={`${inputCls} pl-9 pr-3`} />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPw ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters" autoComplete="new-password" className={`${inputCls} pl-9 pr-10`} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Show or hide password">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < strength ? ['bg-arcade-rose', 'bg-arcade-amber', 'bg-arcade-champagne', 'bg-arcade-sage'][strength - 1] : 'bg-arcade-border'
                      }`} />
                    ))}
                  </div>
                </div>

                <m.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={isSubmitting || isGoogleLoading || nameState === 'taken'}
                  className="w-full py-2.5 rounded-xl bg-arcade-sage text-arcade-dark font-extrabold text-xs shadow-sage-glow hover:bg-white transition-colors flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating account...' : 'Continue to profile'} <ArrowRight className="w-3.5 h-3.5" />
                </m.button>
              </form>

              <div className="pt-3 border-t border-arcade-border text-center text-xs text-slate-400">
                Already registered?{' '}
                <Link href="/auth/sign-in" className="text-arcade-sage font-bold hover:underline">Sign In</Link>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
    </div>
  );
}
