'use client';

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  MonitorUp,
  MonitorOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Gamepad2,
  Send,
  Play,
  Copy,
  Check,
  ArrowLeft,
  Crown,
  Loader2,
  AlertTriangle,
  Users,
  Swords,
  Maximize2,
  Minimize2,
  RotateCw,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { getLaunchUrl } from '@/lib/games/launch';
import { playSfx } from '@/lib/sfx';
import {
  getRoomByCode,
  getIdentity,
  heartbeat,
  normalizeCode,
  roomsBackendReady,
  saveGuestName,
  type PartyRoom,
} from '@/lib/party/rooms';
import { PartyRoomClient, type PeerState } from '@/lib/party/rtc';
import { GameHowToPlayGuide } from '@/components/portal/GameHowToPlayGuide';

// Participant tile
function Tile({
  p,
  deafened,
  compact,
  onFlipCamera,
}: {
  p: PeerState;
  deafened: boolean;
  compact?: boolean;
  onFlipCamera?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const showVideo = p.videoOn || p.screenOn;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (p.stream && p.trackCount > 0) {
      el.srcObject = new MediaStream(p.stream.getTracks());
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [p.stream, p.trackCount]);

  useEffect(() => {
    if (ref.current) ref.current.muted = p.isLocal || deafened;
  }, [p.isLocal, deafened]);

  const initials = p.name.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden bg-[#06070b] border transition-all duration-300 ${
        p.speaking
          ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/40'
          : 'border-white/10 hover:border-white/20'
      } ${compact ? 'w-36 sm:w-44 shrink-0 shadow-md' : 'w-full shadow-xl'}`}
    >
      {/* Video element */}
      <video
        ref={ref}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full ${p.screenOn ? 'object-contain bg-black' : 'object-cover'} ${
          showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${p.isLocal && p.videoOn && !p.screenOn && p.cameraFacing !== 'environment' ? '-scale-x-100' : ''}`}
      />

      {/* Floating Flip Camera button on local tile for mobile & touch users */}
      {p.isLocal && p.videoOn && !p.screenOn && onFlipCamera && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlipCamera();
          }}
          className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white hover:text-[var(--accent)] border border-white/20 transition-all shadow-md active:scale-90 text-[10px] font-bold backdrop-blur-sm cursor-pointer"
          title="Flip camera (Front / Back)"
          aria-label="Flip camera"
        >
          <SwitchCamera className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="capitalize">{p.cameraFacing === 'environment' ? 'Back' : 'Front'}</span>
        </button>
      )}

      {/* Fallback Avatar Initials */}
      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient from-white/[0.04] to-black">
          <div
            className={`rounded-2xl flex items-center justify-center font-black text-black shadow-lg transition-transform ${
              compact ? 'w-10 h-10 text-sm' : 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl'
            } ${p.speaking ? 'scale-110 ring-4 ring-emerald-400/50' : ''}`}
            style={{ backgroundColor: p.color }}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Host Crown Badge */}
      {p.isHost && (
        <span
          className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
          title="Room host"
        >
          <Crown className="w-3 h-3 fill-current" />
        </span>
      )}

      {/* Connection State */}
      {!p.isLocal && p.connection !== 'connected' && (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] text-slate-200 flex items-center gap-1 border border-white/10 backdrop-blur-sm">
          {p.connection === 'failed' ? (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Failed
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" /> Connecting
            </>
          )}
        </span>
      )}

      {/* Participant Name & Status Bar */}
      <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-1 backdrop-blur-[2px]">
        <span className="text-[11px] font-bold text-white truncate flex items-center gap-1">
          {p.name}
          {p.isLocal ? ' (You)' : ''}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {p.screenOn && <MonitorUp className="w-3 h-3 text-[var(--accent)]" />}
          {p.deafened && <HeadphoneOff className="w-3 h-3 text-rose-400" />}
          {!p.audioOn && <MicOff className="w-3 h-3 text-rose-400" />}
        </span>
      </div>
    </div>
  );
}

function gridCols(n: number) {
  if (n <= 1) return 'grid-cols-1 max-w-xl mx-auto';
  if (n <= 4) return 'grid-cols-1 sm:grid-cols-2';
  if (n <= 6) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-4';
}

// In-room view
function RoomView({ room, client, onLeft }: { room: PartyRoom; client: PartyRoomClient; onLeft: () => void }) {
  const searchParams = useSearchParams();
  const isDuel = searchParams?.get('duel') === '1' || searchParams?.get('duel') === 'true';
  const snap = useSyncExternalStore(client.subscribe, client.getSnapshot, client.getSnapshot);
  const [tab, setTab] = useState<'lobby' | 'game'>(isDuel ? 'game' : 'lobby');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mobileFsOrientation, setMobileFsOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [iframeKey, setIframeKey] = useState(1);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastGameSignal = useRef(0);
  const countRef = useRef(1);

  const game = FEATURED_GAMES.find((g) => g.id === room.selected_game_id);
  const me = snap.me;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;
      setIsMobileDevice(mobile);
    }

    const onFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFs) {
        setPseudoFs(false);
        setIsFullscreen(false);
        try {
          if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
        } catch {}
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.documentElement.style.removeProperty('overflow');
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const exitFullscreenCleanly = useCallback(() => {
    setPseudoFs(false);
    setIsFullscreen(false);

    if (typeof document !== 'undefined') {
      const exitFs =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).webkitCancelFullScreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        try {
          exitFs?.call(document);
        } catch {}
      }

      try {
        if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch {}

      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('width');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('height');

      if (document.activeElement && document.activeElement !== document.body) {
        try {
          (document.activeElement as HTMLElement).blur();
        } catch {}
      }
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
    }
  }, []);

  const toggleMobileOrientation = () => {
    const next = mobileFsOrientation === 'landscape' ? 'portrait' : 'landscape';
    setMobileFsOrientation(next);
    playSfx('tap');

    try {
      if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock(next).catch(() => {});
      }
    } catch {}
  };

  const toggleFullscreen = () => {
    const el = gameContainerRef.current || document.documentElement;
    if (!el) return;

    if (pseudoFs || isFullscreen) {
      exitFullscreenCleanly();
      playSfx('tap');
      return;
    }

    playSfx('launch');
    const initialOrientation = game?.orientation === 'portrait' ? 'portrait' : 'landscape';
    setMobileFsOrientation(initialOrientation);

    const requestFs =
      el.requestFullscreen ||
      (el as any).webkitRequestFullscreen ||
      (el as any).webkitRequestFullScreen ||
      (el as any).mozRequestFullScreen ||
      (el as any).msRequestFullscreen;

    if (requestFs) {
      try {
        const res = requestFs.call(el, { navigationUI: 'hide' });
        if (res && typeof res.catch === 'function') {
          res.catch(() => {
            try {
              requestFs.call(el).catch(() => {});
            } catch {}
          });
        }
      } catch {
        try {
          requestFs.call(el);
        } catch {}
      }
    }

    setPseudoFs(true);
    setIsFullscreen(true);

    try {
      if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock(initialOrientation).catch(() => {});
      }
    } catch {}

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  };

  useEffect(() => {
    countRef.current = snap.peers.length;
  }, [snap.peers.length]);

  // Keep room visible in public lobby
  useEffect(() => {
    if (snap.status !== 'connected') return;
    const beat = () => heartbeat(room.code, countRef.current).catch(() => {});
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [snap.status, room.code]);

  // Host launched the game -> all squad members jump to the game tab
  useEffect(() => {
    if (snap.gameSignal > lastGameSignal.current) {
      lastGameSignal.current = snap.gameSignal;
      if (game) {
        setTab('game');
        playSfx('launch');
      }
    }
  }, [snap.gameSignal, game]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' });
  }, [snap.messages.length]);

  useEffect(() => {
    if (snap.status === 'closed' || snap.status === 'full' || snap.status === 'error') onLeft();
  }, [snap.status, onLeft]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.code}`);
    setCopied(true);
    playSfx('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    client.sendChat(text);
    setText('');
    playSfx('tap');
  };

  if (!me) return null;

  const btn = (active: boolean, danger = false) =>
    `flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 shadow-sm ${
      danger
        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white'
        : active
        ? 'bg-white/10 border-white/15 text-slate-100 hover:border-[var(--accent)] hover:text-[var(--accent)]'
        : 'bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
    }`;

  return (
    <div className="space-y-4 pb-16 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              client.leave();
              onLeft();
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Leave room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white truncate">{room.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                {room.code}
              </span>
              {isDuel && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm">
                  <Swords className="w-3 h-3" /> 1v1 DUEL
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> {snap.peers.length}/{room.max_participants}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{room.description || 'Voice, Video & Screen Sharing Party'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-slate-200 hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Invite Squad'}</span>
          </button>

          <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTab('lobby');
                playSfx('tap');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'lobby'
                  ? 'bg-[var(--accent)] text-black shadow-[0_0_12px_var(--accent-glow)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Party
            </button>
            {game && (
              <button
                type="button"
                onClick={() => {
                  setTab('game');
                  playSfx('tap');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  tab === 'game'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Play Game</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {snap.micError && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" /> {snap.micError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Stage */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {tab === 'lobby' ? (
            <div className="p-4 sm:p-6 rounded-3xl border border-white/10 bg-[#090b11]/80 backdrop-blur-xl space-y-4 shadow-2xl">
              <div className={`grid gap-3 ${gridCols(snap.peers.length)}`}>
                {snap.peers.map((p) => (
                  <Tile key={p.id} p={p} deafened={me.deafened} onFlipCamera={() => client.flipCamera()} />
                ))}
              </div>
              {snap.peers.length === 1 && (
                <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-white">You&apos;re the only one here right now!</p>
                  <p>Click &quot;Invite Squad&quot; above to copy your room link and send it to friends.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Compact squad video strip */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {snap.peers.map((p) => (
                  <Tile key={p.id} p={p} deafened={me.deafened} compact onFlipCamera={() => client.flipCamera()} />
                ))}
              </div>

              {/* Game Frame */}
              <div
                ref={gameContainerRef}
                className={`flex flex-col overflow-hidden ${
                  pseudoFs || isFullscreen
                    ? 'fixed inset-0 z-[99999] w-screen h-[100dvh] bg-black m-0 p-0 rounded-none border-0'
                    : 'rounded-2xl border border-white/10 h-[60vh] min-h-[420px] bg-black'
                }`}
              >
                {/* Mobile Fullscreen Floating HUD Pill */}
                {(pseudoFs || isFullscreen) && isMobileDevice && (
                  <div className="fixed top-2.5 right-2.5 z-[100000] flex items-center gap-1.5 p-1 rounded-full bg-black/85 hover:bg-black border border-white/25 shadow-2xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={toggleMobileOrientation}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-[var(--accent)] text-slate-200 hover:text-black font-extrabold text-[10px] active:scale-95 transition-all cursor-pointer"
                      title={`Rotate Screen (${mobileFsOrientation === 'landscape' ? 'Landscape' : 'Portrait'} active)`}
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="uppercase font-mono text-[9px] font-bold">
                        {mobileFsOrientation === 'landscape' ? 'Land' : 'Port'}
                      </span>
                    </button>
                    <div className="w-[1px] h-3 bg-white/20" />
                    <button
                      type="button"
                      onClick={() => {
                        setIframeKey((k) => k + 1);
                        playSfx('tap');
                      }}
                      className="p-1 rounded-full text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                      title="Restart Game"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3 bg-white/20" />
                    <button
                      type="button"
                      onClick={() => {
                        exitFullscreenCleanly();
                        playSfx('tap');
                      }}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white font-extrabold text-[10px] active:scale-95 transition-all cursor-pointer border border-rose-500/30"
                      title="Exit Fullscreen"
                    >
                      <Minimize2 className="w-3 h-3 fill-current" />
                      <span>Exit</span>
                    </button>
                  </div>
                )}

                {/* Desktop Fullscreen Exit Button */}
                {(pseudoFs || isFullscreen) && !isMobileDevice && (
                  <button
                    type="button"
                    onClick={exitFullscreenCleanly}
                    className="fixed top-4 right-4 z-[100000] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black border border-white/30 text-white font-extrabold text-xs shadow-2xl backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                    aria-label="Exit fullscreen"
                  >
                    <Minimize2 className="w-4 h-4 text-[var(--accent)]" />
                    <span>Exit</span>
                  </button>
                )}

                <div
                  className={`items-center justify-between px-4 py-2 bg-black/90 border-b border-white/10 gap-2 ${
                    (pseudoFs || isFullscreen) && isMobileDevice ? 'hidden' : 'flex'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-none">{game?.title}</span>
                    {game && (
                      <button
                        type="button"
                        onClick={() => setShowControlsGuide((prev) => !prev)}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-amber-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                        title="Show how to play on PC & Mobile"
                      >
                        <Gamepad2 className="w-3 h-3 text-amber-400" />
                        <span>{showControlsGuide ? 'Hide' : 'How to Play'}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[var(--accent)] border border-white/15 text-slate-200 hover:text-black text-[11px] font-extrabold transition-all active:scale-95 cursor-pointer shadow-sm"
                      title={isFullscreen || pseudoFs ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                      {isFullscreen || pseudoFs ? <Minimize2 className="w-3.5 h-3.5 fill-current" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span className="hidden xs:inline">{isFullscreen || pseudoFs ? 'Exit' : 'Fullscreen'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('lobby')}
                      className="text-xs font-bold text-[var(--accent)] hover:underline shrink-0"
                    >
                      ← Back to party
                    </button>
                  </div>
                </div>

                {showControlsGuide && game && !isFullscreen && !pseudoFs && (
                  <div className="p-3 bg-black/95 border-b border-white/10 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-48 scrollbar-thin">
                    <GameHowToPlayGuide game={game} variant="compact" />
                  </div>
                )}
                <div className="flex-1 min-h-0 bg-black">
                  <iframe
                    key={iframeKey}
                    src={game ? getLaunchUrl(game, typeof window !== 'undefined' ? window.location.origin : '') : undefined}
                    title={game?.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-orientation-lock allow-presentation allow-modals"
                    allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-[#090b11] border border-white/10 shadow-xl">
            <button type="button" onClick={() => client.toggleMic()} className={btn(me.audioOn)} title="Microphone">
              {me.audioOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{me.audioOn ? 'Mute' : 'Unmute'}</span>
            </button>
            <button type="button" onClick={() => client.toggleCamera()} className={btn(me.videoOn)} title="Camera">
              {me.videoOn ? <Video className="w-4 h-4 text-[var(--accent)]" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{me.videoOn ? 'Camera off' : 'Camera on'}</span>
            </button>
            {me.videoOn && (
              <button
                type="button"
                onClick={() => client.flipCamera()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-white/5 border-white/15 text-slate-100 hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 shadow-sm cursor-pointer"
                title="Flip camera (Front / Back for mobiles)"
              >
                <SwitchCamera className="w-4 h-4 text-[var(--accent)]" />
                <span className="hidden sm:inline">Flip camera</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/50 text-[var(--accent)] border border-[var(--accent)]/30">
                  {me.cameraFacing === 'environment' ? 'Back' : 'Front'}
                </span>
              </button>
            )}
            <button type="button" onClick={() => client.toggleScreen()} className={btn(true)} title="Share your screen">
              {me.screenOn ? <MonitorOff className="w-4 h-4 text-rose-400" /> : <MonitorUp className="w-4 h-4 text-purple-400" />}
              <span className="hidden sm:inline">{me.screenOn ? 'Stop sharing' : 'Share screen'}</span>
            </button>
            <button type="button" onClick={() => client.toggleDeafen()} className={btn(!me.deafened)} title="Deafen (stop hearing everyone)">
              {me.deafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4 text-purple-400" />}
              <span className="hidden sm:inline">{me.deafened ? 'Undeafen' : 'Deafen'}</span>
            </button>

            {client.isHost && game && (
              <button
                type="button"
                onClick={() => {
                  client.launchGameForAll();
                  setTab('game');
                  playSfx('launch');
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent-glow)] hover:bg-white transition-colors active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> <span className="hidden sm:inline">Launch game for squad</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (client.isHost && snap.peers.length > 1 && !window.confirm('End this room for everyone?')) return;
                if (client.isHost) client.endRoom();
                else client.leave();
                onLeft();
              }}
              className={btn(true, true)}
            >
              <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">{client.isHost ? 'End room' : 'Leave'}</span>
            </button>
          </div>

          {game && tab === 'lobby' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center p-1 shrink-0">
                    <img src={game.thumbnail_url} alt={game.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-wider">Party Game</span>
                    <h3 className="text-base font-bold text-white truncate">{game.title}</h3>
                    <p className="text-xs text-slate-400">
                      {game.category} • {game.supported_players}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTab('game');
                    playSfx('tap');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-colors flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current text-[var(--accent)]" /> Open game
                </button>
              </div>

              {/* How to Play Guide */}
              <GameHowToPlayGuide game={game} variant="compact" />
            </div>
          )}
        </div>

        {/* Right Panel: Room Chat */}
        <div className="rounded-2xl border border-white/10 bg-[#090b11] h-[520px] lg:h-[640px] flex flex-col overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-white/10 bg-black/50 flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Room Chat
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {snap.messages.length === 0 && (
              <div className="text-center pt-10 text-slate-500 text-xs space-y-1">
                <p className="font-bold">No messages yet.</p>
                <p className="text-[11px] text-slate-600">Send a greeting to your squad!</p>
              </div>
            )}
            {snap.messages.map((m) => (
              <div key={m.id} className="text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold" style={{ color: m.color }}>
                    {m.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-200 bg-white/[0.04] p-2 rounded-xl border border-white/5 break-words text-[11px] leading-relaxed">
                  {m.text}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={send} className="p-2 border-t border-white/10 bg-black/60 flex gap-2">
            <input
              type="text"
              maxLength={500}
              placeholder="Send a message to party..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[var(--accent)] hover:bg-white text-black font-extrabold transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Room page wrapper
function RoomPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = normalizeCode((params?.id as string) || '');
  const { user } = useAuth();

  const urlCam = searchParams?.get('cam');
  const urlFacing = searchParams?.get('facing') as 'user' | 'environment' | null;
  const urlMic = searchParams?.get('mic');

  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [wantMic, setWantMic] = useState(urlMic !== '0');
  const [wantCam, setWantCam] = useState(urlCam === '1');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>(
    urlFacing === 'environment' ? 'environment' : 'user'
  );
  const [joining, setJoining] = useState(false);
  const [client, setClient] = useState<PartyRoomClient | null>(null);
  const [copied, setCopied] = useState(false);

  const joinPreviewRef = useRef<HTMLVideoElement>(null);

  const stopJoinPreview = useCallback(() => {
    if (joinPreviewRef.current?.srcObject) {
      const stream = joinPreviewRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      joinPreviewRef.current.srcObject = null;
    }
  }, []);

  // Pre-join camera live preview with flip camera for mobiles
  useEffect(() => {
    if (client || !wantCam) {
      stopJoinPreview();
      return;
    }
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 640 },
          height: { ideal: 360 },
        },
      })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (joinPreviewRef.current) {
          joinPreviewRef.current.srcObject = stream;
          joinPreviewRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      stopJoinPreview();
    };
  }, [client, wantCam, cameraFacing, stopJoinPreview]);

  useEffect(() => {
    if (!roomsBackendReady()) {
      setLoadError('Database backend is not available.');
      setLoadState('error');
      return;
    }
    setName(getIdentity(user?.display_name).name);
    getRoomByCode(code)
      .then((r) => {
        if (!r || r.is_closed) setLoadState('notfound');
        else {
          setRoom(r);
          setLoadState('ready');
        }
      })
      .catch((e) => {
        setLoadError(e?.message || 'Could not load the room.');
        setLoadState('error');
      });
  }, [code, user?.display_name]);

  // Clean disconnect when leaving page
  useEffect(() => {
    if (!client) return;
    const bye = () => client.leave();
    window.addEventListener('pagehide', bye);
    return () => {
      window.removeEventListener('pagehide', bye);
      client.leave();
    };
  }, [client]);

  const join = async () => {
    if (!room || joining) return;
    setJoining(true);
    stopJoinPreview();
    playSfx('launch');
    const finalName = (name.trim() || 'Gamer').slice(0, 24);
    if (!user) saveGuestName(finalName);
    const identity = { ...getIdentity(user?.display_name), name: user?.display_name || finalName };
    const c = new PartyRoomClient({
      code: room.code,
      identity,
      maxParticipants: room.max_participants,
      hostClientId: room.host_client_id,
    });
    await c.join({ audio: wantMic, video: wantCam, facingMode: cameraFacing });
    setClient(c);
    setJoining(false);
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    setCopied(true);
    playSfx('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadState === 'loading') {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-300">Entering Gaming Room #{code}...</p>
      </div>
    );
  }

  if (loadState === 'notfound' || !room) {
    return (
      <div className="py-16 text-center rounded-2xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto p-8 space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-white">Room Not Found or Closed</h2>
          <p className="text-xs text-slate-400">
            Room <code className="text-[var(--accent)] font-bold">{code}</code> does not exist or has already been closed.
          </p>
        </div>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-white text-black font-extrabold text-xs shadow-lg transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Active Rooms</span>
        </Link>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="py-16 text-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] max-w-lg mx-auto p-8 space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-white">Connection Error</h2>
          <p className="text-xs text-rose-300">{loadError}</p>
        </div>
        <Link
          href="/rooms"
          className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs transition-all active:scale-95"
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  // Active connected room view
  if (client) {
    return <RoomView room={room} client={client} onLeft={() => router.push('/rooms')} />;
  }

  const selectedGame = FEATURED_GAMES.find((g) => g.id === room.selected_game_id);

  // Pre-join Lobby
  return (
    <div className="py-6 sm:py-10 max-w-xl mx-auto w-full px-2">
      <div className="rounded-3xl border border-white/15 bg-[#090b11]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] font-mono">
              Pixelverse Gaming Party
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{room.name}</h1>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shadow-sm">
            #{room.code}
          </span>
        </div>

        {/* Selected Game Card if Any */}
        {selectedGame && (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/15 flex items-center justify-center p-0.5 shrink-0">
              <img src={selectedGame.thumbnail_url} alt={selectedGame.title} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider">Party Game</span>
              <h4 className="text-xs font-bold text-white truncate">{selectedGame.title}</h4>
              <p className="text-[11px] text-slate-400">
                {selectedGame.category} • {selectedGame.supported_players}
              </p>
            </div>
          </div>
        )}

        {/* Pre-join Camera Live Preview (if enabled) */}
        {wantCam && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-inner">
            <video
              ref={joinPreviewRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraFacing !== 'environment' ? '-scale-x-100' : ''}`}
            />
            <button
              type="button"
              onClick={() => {
                stopJoinPreview();
                setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
              }}
              className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white hover:text-[var(--accent)] border border-white/20 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-sm"
              title="Flip camera"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="capitalize">{cameraFacing === 'environment' ? 'Back' : 'Front'}</span>
            </button>
          </div>
        )}

        {/* Media Controls for Joining */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWantMic(!wantMic)}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
              wantMic
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {wantMic ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span>{wantMic ? 'Mic: Enabled' : 'Mic: Muted'}</span>
          </button>

          <button
            type="button"
            onClick={() => setWantCam(!wantCam)}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
              wantCam
                ? 'bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {wantCam ? <Video className="w-4 h-4 text-[var(--accent)]" /> : <VideoOff className="w-4 h-4" />}
            <span>{wantCam ? 'Camera: On' : 'Camera: Off'}</span>
          </button>
        </div>

        {/* Nickname Form */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-300">Gamer Nickname</label>
            <input
              type="text"
              required
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your gamer tag..."
              className="w-full bg-black/60 border border-white/15 focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
            />
          </div>

          <button
            type="button"
            onClick={join}
            disabled={joining}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-white text-black font-black text-sm uppercase tracking-wider shadow-[0_0_24px_var(--accent-glow)] transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{joining ? 'Connecting to Party...' : 'Join Party Room'}</span>
          </button>
        </div>

        {/* Share Link button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={copyInvite}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Invite Link'}</span>
          </button>
          <Link href="/rooms" className="text-slate-400 hover:text-white transition-colors">
            Back to rooms
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Loading gaming room...</p>
        </div>
      }
    >
      <RoomPageContent />
    </Suspense>
  );
}
