'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Video } from 'lucide-react';

interface JitsiPartyCallProps {
  roomCode: string;
  roomName: string;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  isHost?: boolean;
  onLeft?: () => void;
  onParticipantCountChange?: (count: number) => void;
  className?: string;
  compact?: boolean;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

export function JitsiPartyCall({
  roomCode,
  roomName,
  userName,
  userEmail,
  avatarUrl,
  isHost,
  onLeft,
  onParticipantCountChange,
  className = '',
  compact = false,
}: JitsiPartyCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clean room identifier for Jitsi (alphanumeric only)
  const cleanRoomId = `pixelverse-party-${roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  useEffect(() => {
    let mounted = true;

    const loadScriptAndInit = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load external_api.js if not yet available
        if (!window.JitsiMeetExternalAPI) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById('jitsi-external-api');
            if (existingScript) {
              existingScript.addEventListener('load', () => resolve(), { once: true });
              existingScript.addEventListener('error', () => reject(new Error('Failed to load Jitsi API')), { once: true });
              return;
            }

            const script = document.createElement('script');
            script.id = 'jitsi-external-api';
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Jitsi Meet script. Please check your internet connection.'));
            document.head.appendChild(script);
          });
        }

        if (!mounted || !containerRef.current) return;

        // Dispose existing session if any
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }

        // Initialize Jitsi Meet Iframe
        const domain = 'meet.jit.si';
        const options = {
          roomName: cleanRoomId,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: userName || 'Gamer',
            email: userEmail || undefined,
            avatarURL: avatarUrl || undefined,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true, // Keep mobile users in browser without app store redirect
            enableWelcomePage: false,
            enableClosePage: false,
            hideConferenceSubject: true,
            hideConferenceTimer: false,
            subject: `${roomName} // Pixelverse`,
            toolbarButtons: compact
              ? ['microphone', 'camera', 'desktop', 'hangup', 'tileview']
              : [
                  'microphone',
                  'camera',
                  'desktop', // Screen sharing to stream game!
                  'fullscreen',
                  'fodeviceselection', // Select microphone and headphones
                  'hangup',
                  'chat',
                  'tileview',
                  'videoquality',
                  'settings',
                ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: '#06070b',
            TOOLBAR_ALWAYS_VISIBLE: true,
            MOBILE_APP_PROMO: false,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        // Listen for call events
        api.addEventListener('videoConferenceJoined', () => {
          if (!mounted) return;
          setLoading(false);
          const count = (api.getParticipantsInfo ? api.getParticipantsInfo().length : 0) + 1;
          onParticipantCountChange?.(count);
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (mounted) onLeft?.();
        });

        api.addEventListener('readyToClose', () => {
          if (mounted) onLeft?.();
        });

        api.addEventListener('participantJoined', () => {
          if (!mounted) return;
          const count = (api.getParticipantsInfo ? api.getParticipantsInfo().length : 0) + 1;
          onParticipantCountChange?.(count);
        });

        api.addEventListener('participantLeft', () => {
          if (!mounted) return;
          const count = (api.getParticipantsInfo ? api.getParticipantsInfo().length : 0) + 1;
          onParticipantCountChange?.(count);
        });
      } catch (err: any) {
        if (mounted) {
          setLoading(false);
          setError(err?.message || 'Failed to initialize live meeting.');
        }
      }
    };

    loadScriptAndInit();

    return () => {
      mounted = false;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {}
        apiRef.current = null;
      }
    };
  }, [cleanRoomId, userName, userEmail, avatarUrl, roomName, compact, onLeft, onParticipantCountChange]);

  return (
    <div className={`relative w-full h-full bg-[#06070b] rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col ${className}`}>
      {/* Loading HUD */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-[#06070b]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
              <Video className="w-7 h-7 animate-pulse" />
            </div>
            <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Connecting to Gaming Live Meet...</h3>
            <p className="text-xs text-slate-400">Zero keys required • HD Video, Voice &amp; Screen Sharing</p>
          </div>
        </div>
      )}

      {/* Error HUD */}
      {error && (
        <div className="absolute inset-0 z-30 bg-[#06070b]/95 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-extrabold text-white">Live Call Connection Failed</h3>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all active:scale-95 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Jitsi Iframe Mount Point */}
      <div ref={containerRef} className="w-full h-full flex-1 min-h-0 bg-black" />
    </div>
  );
}
