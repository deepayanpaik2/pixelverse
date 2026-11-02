'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Video, ExternalLink, ShieldCheck } from 'lucide-react';

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

  // Clean, unique room identifier for Jitsi (alphanumeric only)
  const cleanRoomId = `pixelverse-party-${roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const directMeetUrl = `https://meet.jit.si/${cleanRoomId}`;

  useEffect(() => {
    let mounted = true;
    let loadingTimer: NodeJS.Timeout | null = null;

    const loadScriptAndInit = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Load external_api.js safely without hanging
        if (!window.JitsiMeetExternalAPI) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById('jitsi-external-api') as HTMLScriptElement | null;
            if (existingScript) {
              if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
              }
              existingScript.addEventListener('load', () => resolve(), { once: true });
              existingScript.addEventListener('error', () => reject(new Error('Failed to load Jitsi API')), { once: true });
              // Safety timeout in case script already finished loading
              setTimeout(() => {
                if (window.JitsiMeetExternalAPI) resolve();
                else resolve(); // Proceed and let catch block or iframe handle it
              }, 3000);
              return;
            }

            const script = document.createElement('script');
            script.id = 'jitsi-external-api';
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Jitsi Meet script. Please check your network connection.'));
            document.head.appendChild(script);
          });
        }

        if (!mounted || !containerRef.current) return;

        // Verify API is available
        if (!window.JitsiMeetExternalAPI) {
          throw new Error('Jitsi External API is not supported in this browser environment.');
        }

        // Clean up previous instance
        if (apiRef.current) {
          try {
            apiRef.current.dispose();
          } catch {}
          apiRef.current = null;
        }

        // Clear container HTML
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // 2. Initialize Jitsi Meet Iframe
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
            prejoinConfig: {
              enabled: false,
            },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true, // Keep mobile gamers in browser
            enableWelcomePage: false,
            enableClosePage: false,
            hideConferenceSubject: true,
            hideConferenceTimer: false,
            enableInsecureRoomNameAllowed: true,
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

        // Ensure proper permissions on the iframe
        try {
          const iframe = api.getIFrame();
          if (iframe) {
            iframe.allow = 'camera *; microphone *; display-capture *; autoplay *; clipboard-write *';
            iframe.addEventListener('load', () => {
              if (mounted) setLoading(false);
            });
          }
        } catch {}

        // Dismiss loading overlay within 2 seconds so user is NEVER blocked from interacting
        loadingTimer = setTimeout(() => {
          if (mounted) setLoading(false);
        }, 2200);

        // Listen for all call events
        const dismissLoading = () => {
          if (mounted) setLoading(false);
        };

        api.addEventListener('videoConferenceJoined', () => {
          dismissLoading();
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
          dismissLoading();
          const count = (api.getParticipantsInfo ? api.getParticipantsInfo().length : 0) + 1;
          onParticipantCountChange?.(count);
        });

        api.addEventListener('participantLeft', () => {
          const count = (api.getParticipantsInfo ? api.getParticipantsInfo().length : 0) + 1;
          onParticipantCountChange?.(count);
        });

        api.addEventListener('cameraError', dismissLoading);
        api.addEventListener('micError', dismissLoading);
        api.addEventListener('audioMuteStatusChanged', dismissLoading);
        api.addEventListener('videoMuteStatusChanged', dismissLoading);
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
      if (loadingTimer) clearTimeout(loadingTimer);
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
      {/* Top Helper Bar with direct pop-out link in case browser privacy shields restrict iframes */}
      {!compact && (
        <div className="px-3 py-1.5 bg-black/80 border-b border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">Pixelverse Live Meet</span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• Free HD Voice, Video &amp; Screen Share</span>
          </div>
          <a
            href={directMeetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 active:scale-95"
            title="Open in new window or external tab"
          >
            <span>Pop-out Window</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Loading HUD: pointer-events-none ensures user clicks pass straight through to Jitsi iframe! */}
      {loading && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-[#06070b]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in fade-in duration-200">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-white">Launching Gaming Meet...</h3>
            <p className="text-[11px] text-slate-400">Zero keys required • HD Video, Voice &amp; Screen Sharing</p>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all active:scale-95 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <a
              href={directMeetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-white text-black text-xs font-extrabold transition-all active:scale-95 shadow-md"
            >
              <span>Open Direct Meet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Jitsi Iframe Mount Point */}
      <div ref={containerRef} className="w-full h-full flex-1 min-h-0 bg-black" />
    </div>
  );
}
