'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Heart, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Gamepad2, 
  ArrowLeft,
  Check,
  Star,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { getGameBySlug, getRelatedGames, categorySlug } from '@/lib/games';
import { getLaunchUrl, isOnSiteGame } from '@/lib/games/launch';
import { useAuth } from '@/features/auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';
import { GameTile } from '@/components/portal/GameTile';
import { playSfx } from '@/lib/sfx';

export default function GamePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const game = getGameBySlug(slug);
  const { user, favorites, toggleFavorite, rateGame, getUserRating } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFitScreen, setIsFitScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false); // fullscreen fallback for iPhone Safari
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  // Ratings
  const [likes, setLikes] = useState(game?.likes_count || 0);
  const [dislikes, setDislikes] = useState(game?.dislikes_count || 0);
  const [userRating, setUserRating] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // "still loading?" watchdog
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const onSite = game ? isOnSiteGame(game) : true;

  useEffect(() => {
    setShowStuckHint(false);
    setIframeLoaded(false);
  }, [iframeKey, isPlaying]);

  useEffect(() => {
    if (!isPlaying || onSite || hintDismissed || iframeLoaded) return;
    const t = setTimeout(() => setShowStuckHint(true), 8000);
    return () => clearTimeout(t);
  }, [isPlaying, onSite, iframeKey, hintDismissed, iframeLoaded]);

  useEffect(() => {
    if (!isPlaying || onSite || hintDismissed || iframeLoaded) return;
    const t = setTimeout(() => setShowStuckHint(true), 8000);
    return () => clearTimeout(t);
  }, [isPlaying, onSite, iframeKey, hintDismissed, iframeLoaded]);

  // Tell the page a game is running so the falling-glitter backdrop stops using the CPU
  useEffect(() => {
    const el = document.documentElement;
    if (isPlaying) el.dataset.playing = 'true';
    else delete el.dataset.playing;
    return () => { delete el.dataset.playing; };
  }, [isPlaying]);

  // Keep React state in sync with the real browser fullscreen state (Esc key, etc.)
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Esc closes the fallback fullscreen too
  useEffect(() => {
    if (!pseudoFs) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPseudoFs(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [pseudoFs]);

  useEffect(() => {
    if (game) {
      // Record game in user or guest history
      const actorKey = user ? user.id : 'guest';
      mockStore.recordPlayedGame(actorKey, game.slug);

      // Load user rating if any
      setUserRating(getUserRating(game.id));
      setLikes(game.likes_count);
      setDislikes(game.dislikes_count);
    }
  }, [game?.id, user?.id]);

  // Arrow key window scroll blocker when game is playing
  useEffect(() => {
    const preventScroll = (e: KeyboardEvent) => {
      if (isPlaying && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        // Prevent window scroll only when game container is active
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventScroll);
  }, [isPlaying]);

  if (!game) {
    return (
      <div className="py-24 text-center glass-panel rounded-2xl border border-arcade-border max-w-lg mx-auto">
        <Gamepad2 className="w-12 h-12 text-arcade-rose mx-auto mb-3" />
        <h2 className="text-xl font-black text-white">Game Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested game does not exist or has been archived.</p>
        <Link href="/" className="mt-4 inline-block px-5 py-2 bg-arcade-champagne text-arcade-dark font-extrabold text-xs rounded-xl shadow-champagne-glow">
          Return to Pixelverse
        </Link>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const launchUrl = getLaunchUrl(game, origin);

  const isFav = favorites.includes(game.id);
  const related = getRelatedGames(game.id, game.category, 6);
  const alternatives = related.slice(0, 3);
  const catHref = `/category/${categorySlug(game.category)}`;
  const totalVotes = likes + dislikes;
  const ratingPercent = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : null;

  const handleRating = (isLike: boolean) => {
    const res = rateGame(game.id, isLike);
    setLikes(res.likes);
    setDislikes(res.dislikes);
    setUserRating(res.userRating);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (pseudoFs) { setPseudoFs(false); return; }

    // Mobile WebKit does not support standard Element.requestFullscreen(); fall back to CSS pseudo-fullscreen.
    const isIOS =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    if (isIOS) {
      setPseudoFs(true);
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    const request =
      el.requestFullscreen ||
      (el as any).webkitRequestFullscreen ||
      (el as any).mozRequestFullScreen ||
      (el as any).msRequestFullscreen;

    if (request) {
      request.call(el).catch(() => setPseudoFs(true));
    } else {
      setPseudoFs(true);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': game.title,
            'description': game.description,
            'genre': game.category,
            'gamePlatform': 'Web Browser',
            'applicationCategory': 'Game',
            'operatingSystem': 'Any',
            'author': {
              '@type': 'Person',
              'name': game.author,
            },
            ...(game.likes_count + game.dislikes_count > 0
              ? {
                  'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': game.rating_score,
                    'bestRating': '5',
                    'worstRating': '1',
                    'ratingCount': game.likes_count + game.dislikes_count,
                  },
                }
              : {}),
          }),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
          <span>/</span>
          <Link href={catHref} className="hover:text-[var(--accent)] transition-colors">{game.category}</Link>
          <span>/</span>
          <span className="text-white font-extrabold truncate max-w-[200px]">{game.title}</span>
        </div>

        <Link
          href={catHref}
          className="text-[var(--accent)] hover:underline font-black hidden sm:inline"
        >
          More {game.category} Games →
        </Link>
      </div>

      {/* Game player viewport */}
      <div className="relative group">
        {!(pseudoFs || isFullscreen) && (
          <div className="absolute -inset-3 rounded-[2.5rem] blur-2xl opacity-25 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] pointer-events-none transition-opacity duration-500 group-hover:opacity-45" />
        )}
        <div
          ref={containerRef}
          className={`flex flex-col overflow-hidden ${
            pseudoFs || isFullscreen
              ? 'fixed inset-0 z-[99999] w-screen h-[100dvh] bg-black m-0 p-0 rounded-none border-0'
              : `stage-open opal-edge [--edge-opacity:.6] relative glass-panel border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ${
                  isFitScreen
                    ? 'rounded-3xl h-[88vh] min-h-[480px] w-full transition-[height] duration-300'
                    : game.orientation === 'portrait'
                    ? 'rounded-2xl sm:rounded-3xl h-[68svh] min-h-[420px] max-h-[620px] max-w-2xl mx-auto w-full'
                    : 'rounded-2xl sm:rounded-3xl h-[54svh] min-h-[320px] max-h-[560px] sm:h-[76vh] sm:min-h-[520px] sm:max-h-none w-full'
                }`
          }`}
        >
          {pseudoFs && (
            <button
              onClick={() => setPseudoFs(false)}
              className="fixed top-[calc(env(safe-area-inset-top,12px)+8px)] right-4 z-[100000] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black border border-white/30 text-white font-extrabold text-xs shadow-2xl backdrop-blur-md active:scale-95 transition-all"
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="w-4 h-4 text-[var(--accent)]" />
              <span>Exit</span>
            </button>
          )}
          {!isPlaying ? (
            <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#060812] flex items-center justify-center">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 20%, #0d1226 0%, #060812 70%, #020306 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80 pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--accent)] opacity-20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[var(--accent-secondary)] opacity-20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-6 py-8 max-w-3xl w-full justify-center">
                <div className="relative shrink-0">
                  <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] blur-xl opacity-60" />
                  <div className="relative w-36 h-36 sm:w-52 sm:h-52 rounded-[1.75rem] overflow-hidden bg-[#060812] border-2 border-white/20 shadow-2xl flex items-center justify-center p-3">
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className="relative z-10 w-full h-full object-contain rounded-xl drop-shadow-2xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-bold">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-[var(--accent)] border border-[var(--accent)]/30 font-black">
                      {game.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                      {game.supported_players}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black">
                      Free to play
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                      Crafted by Deepayan
                    </span>
                    {onSite && (
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-black">
                        <Zap className="w-3 h-3" /> Runs on Pixelverse
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl text-white font-display font-extrabold leading-tight drop-shadow-lg line-clamp-2">
                    {game.title}
                  </h1>

                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      playSfx('launch');
                    }}
                    data-sfx="launch"
                    className="btn-gaming group relative flex items-center gap-3 px-10 py-4 rounded-full font-black text-lg shadow-[0_12px_28px_-6px_var(--accent-glow)]"
                  >
                    <Play className="relative w-6 h-6 fill-current ml-0.5" />
                    <span className="relative">Play Now</span>
                  </button>

                  <p className="text-xs text-slate-300 font-medium">
                    No download, no sign-up. 100% free instant browser gaming.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 min-h-0 bg-black relative">
              {!iframeLoaded && (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-[#060810] text-center pointer-events-none select-none">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow-xl opacity-75 bg-black/60 flex items-center justify-center p-1">
                    <img src={game.thumbnail_url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="launch-bar" />
                  <p className="text-xs text-slate-300 font-semibold tracking-wide">Connecting to game engine…</p>
                </div>
              )}

              <iframe
                ref={iframeRef}
                key={iframeKey}
                src={launchUrl}
                title={game.title}
                loading="eager"
                onLoad={() => {
                  setIframeLoaded(true);
                  try { iframeRef.current?.focus(); } catch {}
                }}
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-orientation-lock allow-presentation allow-modals allow-downloads"
                allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; display-capture; fullscreen; gamepad; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; screen-wake-lock; web-share"
                allowFullScreen
                className="relative z-10 w-full h-full border-none bg-transparent"
              />
            </div>
          )}

          {/* Viewport Control Bar (Bottom Overlay) */}
          <div className="relative shrink-0 z-40 bg-[#060810]/95 backdrop-blur-xl px-4 py-2.5 border-t border-white/10 flex items-center justify-between pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shrink-0" />
              <h2 className="font-display font-extrabold text-sm text-white truncate max-w-[170px] sm:max-w-xs">{game.title}</h2>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-[var(--accent)] border border-white/10">
                {game.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  playSfx('tap');
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:border-[var(--accent)] transition-all btn-3d"
                title={isPlaying ? 'View Cover Preview' : 'Resume Play'}
              >
                {isPlaying ? <Info className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIframeKey(k => k + 1);
                  setIframeLoaded(false);
                  playSfx('tap');
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:border-[var(--accent)] transition-all btn-3d"
                title="Restart Game"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsFitScreen(!isFitScreen);
                  playSfx('tap');
                }}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-slate-300 hover:text-white hidden sm:block transition-all btn-3d ${
                  isFitScreen ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]' : 'bg-white/5 border-white/15'
                }`}
                title={isFitScreen ? 'Standard View' : 'Theater / Expanded View'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  toggleFullscreen();
                  playSfx('tap');
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all btn-3d"
                title={isFullscreen || pseudoFs ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen || pseudoFs ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen || pseudoFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading help banner */}
      {showStuckHint && !hintDismissed && !iframeLoaded && isPlaying && (
        <div role="status" className="fade-in glass-panel rounded-2xl px-5 py-3.5 text-xs flex flex-col sm:flex-row sm:items-center gap-3 border border-amber-500/30">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed font-medium">
              <span className="font-bold text-white">Connecting is taking longer than usual.</span>{' '}
              Try Reloading, or choose an alternative game from below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIframeKey((k) => k + 1);
                playSfx('tap');
              }}
              className="btn-gaming flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs shadow-md"
            >
              <RefreshCw className="w-3 h-3" /> Reload
            </button>
            {alternatives.slice(0, 2).map((g) => (
              <Link
                key={g.id}
                href={`/game/${g.slug}`}
                className="px-3.5 py-2 rounded-full bg-white/10 border border-white/15 text-slate-200 hover:border-[var(--accent)] font-bold max-w-[11rem] truncate transition-colors"
              >
                {g.title}
              </Link>
            ))}
            <button onClick={() => setHintDismissed(true)} className="px-2 py-2 text-slate-500 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3D Action Bar (Ratings, Favorites, Share) */}
      <div className="drawer-neon p-4 rounded-2xl border border-white/15 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Rating Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleRating(true);
              playSfx('like');
            }}
            data-sfx="like"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-black transition-all btn-3d ${
              userRating === true
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:border-emerald-400/50'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => {
              handleRating(false);
              playSfx('like');
            }}
            data-sfx="like"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-black transition-all btn-3d ${
              userRating === false
                ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:border-rose-400/50'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{dislikes}</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-400 ml-1">
            {ratingPercent === null ? 'Be the first to rate' : `${ratingPercent}% positive`}
          </span>
        </div>

        {/* Favorite, Party & Share Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/arcade"
            onClick={() => playSfx('tap')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-black text-slate-200 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all btn-3d"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">Arcade</span>
          </Link>

          <Link
            href={`/rooms?game=${game.id}`}
            onClick={() => playSfx('tap')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-xs font-black text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all shadow-sm btn-3d"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Create Party</span>
          </Link>

          <button
            onClick={() => {
              toggleFavorite(game.id);
              playSfx('like');
            }}
            data-sfx="like"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-black transition-all btn-3d ${
              isFav
                ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.5)]'
                : 'bg-white/5 border-white/15 text-slate-200 hover:text-rose-400 hover:border-rose-400/40'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'Saved' : 'Favorite'}</span>
          </button>

          <button
            onClick={() => {
              copyShareLink();
              playSfx('tap');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-black text-slate-200 hover:text-white transition-all btn-3d"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => {
              setShowReportModal(true);
              playSfx('tap');
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-slate-400 hover:text-rose-400 hover:border-rose-400/40 transition-all btn-3d"
            title="Report Broken Game"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description, How to Play, & Licensing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Overview & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-arcade-border space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">About {game.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Category: {game.category} • Publisher: {game.author}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {game.description}
            </p>

            {/* How to Play Section */}
            {game.instructions && (
              <div className="pt-4 border-t border-arcade-border/60 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-arcade-champagne" /> How to Play
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-arcade-midnight p-3.5 rounded-xl border border-arcade-border">
                  {game.instructions}
                </p>
              </div>
            )}

            {/* Controls Guide */}
            <div className="pt-4 border-t border-arcade-border/60 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {!!game.controls.keyboard?.length && (
                  <div className="bg-arcade-midnight p-3 rounded-xl border border-arcade-border flex items-center justify-between">
                    <span className="text-slate-400">Keyboard:</span>
                    <span className="font-bold text-arcade-champagne">{game.controls.keyboard.join(', ')}</span>
                  </div>
                )}
                {game.controls.touch && (
                  <div className="bg-arcade-midnight p-3 rounded-xl border border-arcade-border flex items-center justify-between">
                    <span className="text-slate-400">Touch/Mobile:</span>
                    <span className="font-bold text-arcade-sage">Tap & Swipe Supported</span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Tags */}
            <div className="pt-3 border-t border-arcade-border/60 flex flex-wrap gap-1.5">
              {game.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="px-2.5 py-1 rounded-lg bg-arcade-surface border border-arcade-border text-[11px] font-semibold text-slate-400 hover:text-arcade-champagne hover:border-arcade-champagne transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: License & Safety */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-arcade-border space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-arcade-sage" /> Licensing & Attribution
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-mono text-arcade-champagne uppercase text-[10px]">{game.source_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License:</span>
                <span className="font-mono text-white text-[10px] truncate max-w-[150px]">{game.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Publisher:</span>
                <span className="text-slate-200">{game.author}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games Row */}
      {related.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-arcade-border/60">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">You May Also Like</h3>
            <Link href={catHref} className="text-xs font-bold text-arcade-champagne hover:underline">
              View All {game.category} Games
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map(rg => (
              <GameTile key={rg.id} game={rg} size="1x1" />
            ))}
          </div>
        </section>
      )}

      {/* Report Broken Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-arcade-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-arcade-rose" /> Report Issue: {game.title}
            </h3>
            <p className="text-xs text-slate-400">
              Is this game failing to load, displaying broken controls, or infringing copyright? Please let us know.
            </p>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Explain the issue..."
              className="w-full bg-arcade-midnight border border-arcade-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-arcade-rose"
            />
            <div className="flex justify-between items-center pt-2">
              <Link href="/dmca" className="text-[11px] text-arcade-rose hover:underline">
                DMCA Copyright Claim →
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-arcade-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (reportText.trim()) {
                      mockStore.createReport({
                        reporter_id: user ? user.id : 'guest',
                        target_type: 'game',
                        target_id: game.id,
                        reason: `Game Issue: ${game.title}`,
                        details: reportText.trim()
                      });
                    }
                    setShowReportModal(false);
                    setReportText('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-arcade-rose text-white hover:bg-arcade-rose/80"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
