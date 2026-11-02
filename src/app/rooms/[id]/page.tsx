'use client';

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
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
  PhoneOff,
  Video,
  Share2,
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
  loadMessages,
  saveMessage,
  closeRoom,
  type PartyRoom,
  type SavedMessage,
  type Identity,
} from '@/lib/party/rooms';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { JitsiPartyCall } from '@/components/party/JitsiPartyCall';
import { GameHowToPlayGuide } from '@/components/portal/GameHowToPlayGuide';

interface ChatMsg {
  id: string;
  senderId: string;
  name: string;
  color: string;
  text: string;
  ts: number;
}

const COLORS = ['#00f0ff', '#39ff14', '#ff0055', '#9d4edd', '#ffbe0b', '#ff7a00', '#4cc9f0', '#f72585'];

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

// In-room view
function RoomView({
  room,
  identity,
  userEmail,
  avatarUrl,
  onLeft,
}: {
  room: PartyRoom;
  identity: Identity;
  userEmail?: string;
  avatarUrl?: string;
  onLeft: () => void;
}) {
  const searchParams = useSearchParams();
  const isDuel = searchParams?.get('duel') === '1' || searchParams?.get('duel') === 'true';
  const isHost = identity.clientId === room.host_client_id;

  const [tab, setTab] = useState<'lobby' | 'game'>(isDuel ? 'game' : 'lobby');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mobileFsOrientation, setMobileFsOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [iframeKey, setIframeKey] = useState(1);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const game = FEATURED_GAMES.find((g) => g.id === room.selected_game_id);

  // Detect mobile
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

  // Heartbeat to keep room active in public lobby
  useEffect(() => {
    const beat = () => heartbeat(room.code, participantCount).catch(() => {});
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [room.code, participantCount]);

  // Load chat history & setup Supabase Realtime channel for chat & game launch broadcast
  useEffect(() => {
    let mounted = true;

    // Load initial messages
    loadMessages(room.code)
      .then((history) => {
        if (!mounted || !history || history.length === 0) return;
        setMessages(
          history.map((h) => ({
            id: h.id,
            senderId: h.client_id,
            name: h.sender_name,
            color: colorFor(h.client_id),
            text: h.body,
            ts: new Date(h.created_at).getTime(),
          }))
        );
      })
      .catch(() => {});

    // Supabase Realtime channel for instant text chat and game signals
    let channel: any = null;
    if (isSupabaseConfigured()) {
      channel = supabase.channel(`party-sync-${room.code}`);
      channel
        .on('broadcast', { event: 'chat' }, ({ payload }: { payload: ChatMsg }) => {
          if (!mounted || !payload) return;
          setMessages((prev) => (prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]));
        })
        .on('broadcast', { event: 'launch-game' }, () => {
          if (!mounted || !game) return;
          setTab('game');
          playSfx('launch');
        })
        .on('broadcast', { event: 'room-closed' }, () => {
          if (!mounted) return;
          alert('The host has ended this party room.');
          onLeft();
        })
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [room.code, game, onLeft]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.code}`);
    setCopied(true);
    playSfx('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const newMsg: ChatMsg = {
      id: msgId,
      senderId: identity.clientId,
      name: identity.name,
      color: identity.color || colorFor(identity.clientId),
      text: text.trim(),
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setText('');
    playSfx('tap');

    // Save to database & broadcast
    saveMessage(room.code, msgId, identity.clientId, identity.name, newMsg.text).catch(() => {});
    if (isSupabaseConfigured()) {
      try {
        const ch = supabase.channel(`party-sync-${room.code}`);
        ch.send({
          type: 'broadcast',
          event: 'chat',
          payload: newMsg,
        });
      } catch {}
    }
  };

  const handleLaunchGameForAll = () => {
    if (!game) return;
    setTab('game');
    playSfx('launch');
    if (isSupabaseConfigured()) {
      try {
        const ch = supabase.channel(`party-sync-${room.code}`);
        ch.send({
          type: 'broadcast',
          event: 'launch-game',
          payload: {},
        });
      } catch {}
    }
  };

  const handleEndOrLeave = async () => {
    if (isHost && participantCount > 1 && !window.confirm('End this room for everyone?')) {
      return;
    }
    if (isHost) {
      if (isSupabaseConfigured()) {
        try {
          const ch = supabase.channel(`party-sync-${room.code}`);
          ch.send({
            type: 'broadcast',
            event: 'room-closed',
            payload: {},
          });
        } catch {}
      }
      await closeRoom(room.code, identity.clientId).catch(() => {});
    }
    onLeft();
  };

  return (
    <div className="space-y-4 pb-16 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onLeft}
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
                <Users className="w-3.5 h-3.5 text-emerald-400" /> {participantCount}/{room.max_participants}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{room.description || 'Live Voice, Video & Screen Sharing Party'}</p>
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'lobby'
                  ? 'bg-[var(--accent)] text-black shadow-[0_0_12px_var(--accent-glow)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Meet</span>
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

          <button
            type="button"
            onClick={handleEndOrLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 border border-rose-500/30 text-rose-200 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            title={isHost ? 'End room for everyone' : 'Leave room'}
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHost ? 'End Party' : 'Leave'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Stage: Jitsi Meet or Game + Compact Squad Strip */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {tab === 'lobby' ? (
            <div className="space-y-4">
              {/* Fullscreen Google Meet Style Grid Video Call */}
              <div className="h-[520px] sm:h-[620px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <JitsiPartyCall
                  roomCode={room.code}
                  roomName={room.name}
                  userName={identity.name}
                  userEmail={userEmail}
                  avatarUrl={avatarUrl}
                  isHost={isHost}
                  onLeft={onLeft}
                  onParticipantCountChange={(c) => setParticipantCount(Math.max(1, c))}
                  compact={false}
                />
              </div>

              {/* Game Quick-Launch Banner if Room Has Selected Game */}
              {game && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/15 flex items-center justify-center p-0.5 shrink-0">
                      <img src={game.thumbnail_url} alt={game.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-wider">Party Game</span>
                      <h3 className="text-sm font-extrabold text-white truncate">{game.title}</h3>
                      <p className="text-[11px] text-slate-400">
                        {game.category} • {game.supported_players}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isHost && (
                      <button
                        type="button"
                        onClick={handleLaunchGameForAll}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-white text-black font-extrabold text-xs shadow-[0_0_15px_var(--accent-glow)] transition-all active:scale-95 cursor-pointer"
                        title="Broadcast launch to all squad members"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Launch for Squad</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('game');
                        playSfx('tap');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Open Canvas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Compact Squad Video Call Strip while Playing */}
              <div className="h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
                <JitsiPartyCall
                  roomCode={room.code}
                  roomName={room.name}
                  userName={identity.name}
                  userEmail={userEmail}
                  avatarUrl={avatarUrl}
                  isHost={isHost}
                  onLeft={onLeft}
                  onParticipantCountChange={(c) => setParticipantCount(Math.max(1, c))}
                  compact={true}
                />
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
                      ← Back to Meet
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
        </div>

        {/* Right Panel: Realtime Room Chat */}
        <div className="rounded-2xl border border-white/10 bg-[#090b11] h-[520px] sm:h-[620px] flex flex-col overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-white/10 bg-black/50 flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Room Chat
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Synced</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {messages.length === 0 && (
              <div className="text-center pt-10 text-slate-500 text-xs space-y-1">
                <p className="font-bold">No messages yet.</p>
                <p className="text-[11px] text-slate-600">Send a greeting to your gaming party!</p>
              </div>
            )}
            {messages.map((m) => (
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
              title="Send"
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

  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomsBackendReady()) {
      setLoadError('Database backend is not available.');
      setLoadState('error');
      return;
    }

    const defaultName = getIdentity(user?.display_name).name;
    setName(defaultName);

    getRoomByCode(code)
      .then((r) => {
        if (!r || r.is_closed) {
          setLoadState('notfound');
        } else {
          setRoom(r);
          setLoadState('ready');
        }
      })
      .catch((e) => {
        setLoadError(e?.message || 'Could not load gaming room.');
        setLoadState('error');
      });
  }, [code, user?.display_name]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const finalName = (name.trim() || 'Gamer').slice(0, 24);
    if (!user) saveGuestName(finalName);
    playSfx('launch');
    setJoined(true);
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
            Room <code className="text-[var(--accent)] font-bold">{code}</code> does not exist or has already been closed by its host.
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

  const identity: Identity = {
    ...getIdentity(user?.display_name),
    name: user?.display_name || (name.trim() || 'Gamer').slice(0, 24),
  };

  const selectedGame = FEATURED_GAMES.find((g) => g.id === room.selected_game_id);

  // If already joined, show full active room view
  if (joined) {
    return (
      <RoomView
        room={room}
        identity={identity}
        avatarUrl={user?.avatar_url || undefined}
        onLeft={() => router.push('/rooms')}
      />
    );
  }

  // Pre-join Lobby
  return (
    <div className="py-6 sm:py-10 max-w-xl mx-auto w-full px-2">
      <div className="rounded-3xl border border-white/15 bg-[#090b11]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] font-mono">
              Pixelverse Live Meet
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

        {/* Features Checklist */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>HD Voice &amp; Video</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>Screen &amp; Game Stream</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <span>Google Meet Grid View</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span>100% Free &amp; Unlimited</span>
          </div>
        </div>

        {/* Nickname Form */}
        <form onSubmit={handleJoin} className="space-y-4">
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
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-white text-black font-black text-sm uppercase tracking-wider shadow-[0_0_24px_var(--accent-glow)] transition-all active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4 fill-current" />
            <span>Join Party Meet</span>
          </button>
        </form>

        {/* Share Link button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={copyInvite}
            className="flex items-center gap-1.5 text-slate-400 hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
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
