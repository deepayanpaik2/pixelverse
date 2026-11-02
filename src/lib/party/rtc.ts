/**
 * Party Room Realtime Engine powered by LiveKit Cloud
 *
 * Architecture:
 * - Media Transport & SFU    : LiveKit Cloud SFU (wss://deep-pixelverse-3ap1vw7o.livekit.cloud)
 * - Server Authentication     : Next.js API (/api/party/livekit-token) with JWT AccessToken
 * - Chat & Game Signaling     : LiveKit High-Speed Reliable Data Channel + Supabase persistent fallback
 * - Network & NAT Traversal   : LiveKit Global TURN Relay Network (bypasses CGNAT & Symmetric NAT)
 */

import {
  Room,
  RoomEvent,
  Track,
  createLocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrackPublication,
  type RemoteTrack,
  type Participant,
  type LocalTrackPublication,
} from 'livekit-client';
import { closeRoom, loadMessages, saveMessage, type Identity } from './rooms';

export interface PeerState {
  id: string;
  name: string;
  color: string;
  audioOn: boolean;
  videoOn: boolean; // camera on
  screenOn: boolean; // sharing screen
  cameraFacing?: 'user' | 'environment';
  deafened: boolean;
  speaking: boolean;
  isLocal: boolean;
  isHost: boolean;
  joinedAt: number;
  stream: MediaStream | null;
  trackCount: number;
  connection: 'local' | 'connecting' | 'connected' | 'failed' | 'closed';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  name: string;
  color: string;
  text: string;
  ts: number;
}

export type RoomStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'full' | 'closed';

export interface RoomSnapshot {
  status: RoomStatus;
  error: string | null;
  micError: string | null;
  me: PeerState | null;
  peers: PeerState[]; // everyone, local user first
  messages: ChatMessage[];
  gameSignal: number;
}

const COLORS = ['#00f0ff', '#39ff14', '#ff0055', '#9d4edd', '#ffbe0b', '#ff7a00', '#4cc9f0', '#f72585'];

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export class PartyRoomClient {
  readonly code: string;
  readonly identity: Identity;
  readonly maxParticipants: number;
  readonly hostClientId: string;
  readonly isHost: boolean;

  private room: Room | null = null;
  private status: RoomStatus = 'idle';
  private error: string | null = null;
  private micError: string | null = null;
  private me: PeerState;
  private peers: PeerState[] = [];
  private messages: ChatMessage[] = [];
  private gameSignal = 0;
  private cameraFacing: 'user' | 'environment' = 'user';

  private listeners = new Set<() => void>();
  private cachedSnapshot: RoomSnapshot;

  constructor(opts: {
    code: string;
    identity: Identity;
    maxParticipants: number;
    hostClientId: string;
  }) {
    this.code = opts.code;
    this.identity = opts.identity;
    this.maxParticipants = opts.maxParticipants;
    this.hostClientId = opts.hostClientId;
    this.isHost = opts.identity.clientId === opts.hostClientId;

    this.me = {
      id: opts.identity.clientId,
      name: opts.identity.name,
      color: opts.identity.color || colorFor(opts.identity.clientId),
      audioOn: true,
      videoOn: false,
      screenOn: false,
      cameraFacing: 'user',
      deafened: false,
      speaking: false,
      isLocal: true,
      isHost: this.isHost,
      joinedAt: Date.now(),
      stream: null,
      trackCount: 0,
      connection: 'local',
    };

    this.peers = [this.me];
    this.cachedSnapshot = this.buildSnapshot();
  }

  // useSyncExternalStore subscribe and getSnapshot
  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getSnapshot = (): RoomSnapshot => {
    return this.cachedSnapshot;
  };

  private emit() {
    this.cachedSnapshot = this.buildSnapshot();
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[LiveKit] Subscriber error:', err);
      }
    });
  }

  private buildSnapshot(): RoomSnapshot {
    return {
      status: this.status,
      error: this.error,
      micError: this.micError,
      me: { ...this.me },
      peers: this.peers.map((p) => ({ ...p })),
      messages: [...this.messages],
      gameSignal: this.gameSignal,
    };
  }

  /**
   * Connect to LiveKit Cloud SFU Room
   */
  async join(opts?: {
    audio?: boolean;
    video?: boolean;
    facingMode?: 'user' | 'environment';
  }): Promise<void> {
    if (this.status === 'connecting' || this.status === 'connected') return;

    this.status = 'connecting';
    this.error = null;
    this.micError = null;
    this.cameraFacing = opts?.facingMode || 'user';
    this.me.cameraFacing = this.cameraFacing;
    this.emit();

    // 1. Fetch historical room messages
    loadMessages(this.code)
      .then((history) => {
        if (history.length > 0) {
          const formatted: ChatMessage[] = history.map((h) => ({
            id: h.id,
            senderId: h.client_id,
            name: h.sender_name,
            color: colorFor(h.client_id),
            text: h.body,
            ts: new Date(h.created_at).getTime(),
          }));
          this.messages = formatted;
          this.emit();
        }
      })
      .catch(() => {});

    try {
      // 2. Fetch authenticated LiveKit AccessToken from Next.js server endpoint
      const tokenRes = await fetch('/api/party/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.code,
          identity: this.identity.clientId,
          name: this.identity.name,
          color: this.identity.color,
          isHost: this.isHost,
        }),
      });

      if (!tokenRes.ok) {
        const data = await tokenRes.json().catch(() => ({}));
        if (data.missingConfig) {
          this.status = 'error';
          this.error =
            'LiveKit Cloud credentials required: Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in your environment variables.';
          this.emit();
          return;
        }
        throw new Error(data.error || `Server responded with ${tokenRes.status}`);
      }

      const { token, url, identity: serverIdentity } = await tokenRes.json();
      if (!token) throw new Error('No access token received from server');

      // Update identity if server derived one from authenticated user session
      if (serverIdentity && serverIdentity !== this.me.id) {
        this.me.id = serverIdentity;
      }

      // 3. Instantiate LiveKit Client Room with adaptive bandwidth and noise suppression
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 },
        },
      });

      this.room = room;
      this.bindRoomEvents(room);

      // 4. Connect to LiveKit Cloud Room
      console.log(`[LiveKit] Connecting to ${url} for room ${this.code}...`);
      await room.connect(url, token);
      console.log(`[LiveKit] Successfully connected to room: ${room.name}`);

      // 5. Unlock audio playback for browser autoplay policies
      await room.startAudio().catch(() => {});

      // 6. Publish Initial Audio Track
      if (opts?.audio !== false) {
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          this.me.audioOn = true;
        } catch (err: any) {
          console.warn('[LiveKit] Microphone access denied or unavailable:', err?.message || err);
          this.micError = 'Microphone permission denied. Click unmute when ready.';
          this.me.audioOn = false;
        }
      } else {
        this.me.audioOn = false;
      }

      // 7. Publish Initial Video Track
      if (opts?.video) {
        try {
          await room.localParticipant.setCameraEnabled(true, {
            facingMode: this.cameraFacing,
          });
          this.me.videoOn = true;
        } catch (err: any) {
          console.warn('[LiveKit] Camera access denied or unavailable:', err?.message || err);
          this.me.videoOn = false;
        }
      } else {
        this.me.videoOn = false;
      }

      // 8. Rebuild local stream and sync participant list
      this.status = 'connected';
      this.rebuildLocalStream();
      this.rebuildPeers();
      this.emit();
    } catch (err: any) {
      console.error('[LiveKit Join Error]', err);
      this.status = 'error';
      this.error = err?.message || 'Could not connect to the video room.';
      this.emit();
    }
  }

  /**
   * Bind LiveKit Room events
   */
  private bindRoomEvents(room: Room) {
    // Participant connected
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log(`[LiveKit] Participant joined: ${participant.identity} (${participant.name})`);
      this.rebuildPeers();
      this.emit();
    });

    // Participant disconnected
    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log(`[LiveKit] Participant left: ${participant.identity}`);
      this.rebuildPeers();
      this.emit();
    });

    // Remote track subscribed
    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log(`[LiveKit] Track subscribed: ${track.kind} from ${participant.identity}`);
        // Attach audio tracks to ensure audio plays reliably across all browsers
        if (track.kind === Track.Kind.Audio) {
          try {
            track.attach();
          } catch {}
        }
        this.rebuildPeers();
        this.emit();
      }
    );

    // Remote track unsubscribed
    room.on(
      RoomEvent.TrackUnsubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log(`[LiveKit] Track unsubscribed: ${track.kind} from ${participant.identity}`);
        try {
          track.detach();
        } catch {}
        this.rebuildPeers();
        this.emit();
      }
    );

    // Track muted / unmuted
    room.on(RoomEvent.TrackMuted, () => {
      this.rebuildPeers();
      this.emit();
    });

    room.on(RoomEvent.TrackUnmuted, () => {
      this.rebuildPeers();
      this.emit();
    });

    // Local tracks published
    room.on(RoomEvent.LocalTrackPublished, () => {
      this.rebuildLocalStream();
      this.emit();
    });

    room.on(RoomEvent.LocalTrackUnpublished, () => {
      this.rebuildLocalStream();
      this.emit();
    });

    // Active speakers
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      const activeIds = new Set(speakers.map((s) => s.identity));
      this.me.speaking = activeIds.has(this.me.id);
      this.peers.forEach((p) => {
        if (!p.isLocal) {
          p.speaking = activeIds.has(p.id);
        }
      });
      this.emit();
    });

    // Data received (Chat messages, game launch signals, end room signals)
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'chat' && data.message) {
          this.pushMessage(data.message);
        } else if (data.type === 'game') {
          console.log('[LiveKit] Received game launch signal from host');
          this.gameSignal++;
          this.emit();
        } else if (data.type === 'end_room') {
          console.log('[LiveKit] Room ended by host');
          this.leave();
        }
      } catch (err) {
        console.warn('[LiveKit] Malformed data packet received:', err);
      }
    });

    // Reconnecting / Reconnected states
    room.on(RoomEvent.Reconnecting, () => {
      console.warn('[LiveKit] Reconnecting to room...');
      this.peers.forEach((p) => {
        if (!p.isLocal) p.connection = 'connecting';
      });
      this.emit();
    });

    room.on(RoomEvent.Reconnected, () => {
      console.log('[LiveKit] Reconnected successfully');
      this.rebuildPeers();
      this.emit();
    });

    // Disconnected
    room.on(RoomEvent.Disconnected, () => {
      console.log('[LiveKit] Disconnected from room');
      this.status = 'closed';
      this.rebuildPeers();
      this.emit();
    });
  }

  /**
   * Reconstruct the local participant MediaStream
   */
  private rebuildLocalStream() {
    if (!this.room) return;
    const local = this.room.localParticipant;
    const tracks: MediaStreamTrack[] = [];

    local.videoTrackPublications.forEach((pub: LocalTrackPublication) => {
      if (pub.track && pub.track.mediaStreamTrack && !pub.isMuted) {
        tracks.push(pub.track.mediaStreamTrack);
      }
    });

    local.audioTrackPublications.forEach((pub: LocalTrackPublication) => {
      if (pub.track && pub.track.mediaStreamTrack && !pub.isMuted) {
        tracks.push(pub.track.mediaStreamTrack);
      }
    });

    this.me.stream = tracks.length > 0 ? new MediaStream(tracks) : null;
    this.me.trackCount = tracks.length;
    this.me.videoOn = local.isCameraEnabled;
    this.me.audioOn = local.isMicrophoneEnabled;
    this.me.screenOn = local.isScreenShareEnabled;
    this.me.cameraFacing = this.cameraFacing;
  }

  /**
   * Synchronize remote participants into PeerState array
   */
  private rebuildPeers() {
    if (!this.room) {
      this.peers = [{ ...this.me }];
      return;
    }

    const peerList: PeerState[] = [{ ...this.me }];

    this.room.remoteParticipants.forEach((remote: RemoteParticipant) => {
      const tracks: MediaStreamTrack[] = [];

      remote.videoTrackPublications.forEach((pub) => {
        if (pub.track && pub.track.mediaStreamTrack && pub.isSubscribed && !pub.isMuted) {
          tracks.push(pub.track.mediaStreamTrack);
        }
      });

      remote.audioTrackPublications.forEach((pub) => {
        if (pub.track && pub.track.mediaStreamTrack && pub.isSubscribed && !pub.isMuted) {
          tracks.push(pub.track.mediaStreamTrack);
        }
      });

      // Parse metadata for color and host badge
      let color = colorFor(remote.identity);
      let isRemoteHost = remote.identity === this.hostClientId;

      if (remote.metadata) {
        try {
          const parsed = JSON.parse(remote.metadata);
          if (parsed.color) color = parsed.color;
          if (typeof parsed.isHost === 'boolean') isRemoteHost = parsed.isHost;
        } catch {}
      }

      peerList.push({
        id: remote.identity,
        name: remote.name || 'Player',
        color,
        audioOn: remote.isMicrophoneEnabled,
        videoOn: remote.isCameraEnabled,
        screenOn: remote.isScreenShareEnabled,
        deafened: false,
        speaking: remote.isSpeaking,
        isLocal: false,
        isHost: isRemoteHost,
        joinedAt: remote.joinedAt ? remote.joinedAt.getTime() : Date.now(),
        stream: tracks.length > 0 ? new MediaStream(tracks) : null,
        trackCount: tracks.length,
        connection: remote.connectionQuality === 'lost' ? 'failed' : 'connected',
      });
    });

    this.peers = peerList;
  }

  /**
   * Microphone Toggle
   */
  async toggleMic(): Promise<void> {
    if (!this.room) return;
    const next = !this.me.audioOn;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(next);
      this.me.audioOn = next;
      this.micError = null;
      this.rebuildLocalStream();
      this.emit();
    } catch (err: any) {
      console.warn('[LiveKit] toggleMic failed:', err);
      this.micError = 'Microphone access failed. Please check browser permissions.';
      this.emit();
    }
  }

  /**
   * Camera Toggle
   */
  async toggleCamera(): Promise<void> {
    if (!this.room) return;
    const next = !this.me.videoOn;
    try {
      await this.room.localParticipant.setCameraEnabled(next, {
        facingMode: this.cameraFacing,
      });
      this.me.videoOn = next;
      this.rebuildLocalStream();
      this.emit();
    } catch (err: any) {
      console.warn('[LiveKit] toggleCamera failed:', err);
      this.emit();
    }
  }

  /**
   * Flip Camera for Mobile & Touch devices (Front / Back)
   */
  async flipCamera(): Promise<void> {
    if (!this.room || !this.me.videoOn) return;
    const nextFacing = this.cameraFacing === 'user' ? 'environment' : 'user';
    this.cameraFacing = nextFacing;
    this.me.cameraFacing = nextFacing;

    try {
      const camPub = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (camPub && camPub.track) {
        await this.room.localParticipant.unpublishTrack(camPub.track);
        camPub.track.stop();
      }

      const newTrack = await createLocalVideoTrack({
        facingMode: nextFacing,
        resolution: { width: 1280, height: 720, frameRate: 30 },
      });

      await this.room.localParticipant.publishTrack(newTrack, {
        source: Track.Source.Camera,
      });

      this.rebuildLocalStream();
      this.emit();
    } catch (err: any) {
      console.error('[LiveKit] Flip camera failed:', err);
    }
  }

  /**
   * Screen Share Toggle
   */
  async toggleScreen(): Promise<void> {
    if (!this.room) return;
    const next = !this.me.screenOn;
    try {
      await this.room.localParticipant.setScreenShareEnabled(next);
      this.me.screenOn = next;
      this.rebuildLocalStream();
      this.emit();
    } catch (err: any) {
      console.warn('[LiveKit] toggleScreen failed or cancelled:', err);
      this.me.screenOn = false;
      this.rebuildLocalStream();
      this.emit();
    }
  }

  /**
   * Deafen Toggle (Stop hearing remote audio)
   */
  toggleDeafen(): void {
    this.me.deafened = !this.me.deafened;
    if (this.room) {
      this.room.remoteParticipants.forEach((p) => {
        p.audioTrackPublications.forEach((pub) => {
          if (pub.track?.mediaStreamTrack) {
            pub.track.mediaStreamTrack.enabled = !this.me.deafened;
          }
        });
      });
    }
    this.emit();
  }

  /**
   * Send live chat message
   */
  async sendChat(text: string): Promise<void> {
    const clean = text.trim().slice(0, 500);
    if (!clean) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: this.me.id,
      name: this.me.name,
      color: this.me.color,
      text: clean,
      ts: Date.now(),
    };

    this.pushMessage(msg);

    if (this.room) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'chat', message: msg }));
        await this.room.localParticipant.publishData(payload, { reliable: true });
      } catch (err) {
        console.warn('[LiveKit] publishData failed:', err);
      }
    }

    saveMessage(this.code, msg.id, this.identity.clientId, msg.name, msg.text).catch(() => {});
  }

  private pushMessage(m: ChatMessage) {
    if (this.messages.some((x) => x.id === m.id)) return;
    this.messages = [...this.messages, m].slice(-200);
    this.emit();
  }

  /**
   * Host: Launch party game for everyone in the room
   */
  async launchGameForAll(): Promise<void> {
    if (!this.isHost) return;
    if (this.room) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'game' }));
        await this.room.localParticipant.publishData(payload, { reliable: true });
      } catch (err) {
        console.warn('[LiveKit] launchGameForAll broadcast failed:', err);
      }
    }
    this.gameSignal++;
    this.emit();
  }

  signalGame(): Promise<void> {
    return this.launchGameForAll();
  }

  /**
   * Host: End room for everyone
   */
  async endRoom(): Promise<void> {
    if (!this.isHost) return;
    if (this.room) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'end_room' }));
        await this.room.localParticipant.publishData(payload, { reliable: true });
      } catch {}
    }
    closeRoom(this.code, this.identity.clientId).catch(() => {});
    this.leave();
  }

  /**
   * Leave room and clean up media tracks
   */
  leave(): void {
    if (this.room) {
      try {
        this.room.disconnect();
      } catch {}
      this.room = null;
    }

    if (this.me.stream) {
      this.me.stream.getTracks().forEach((t) => t.stop());
      this.me.stream = null;
    }

    this.status = 'closed';
    this.emit();
  }

  /**
   * Manual reconnect / refresh handler
   */
  async reconnect(peerId?: string): Promise<void> {
    if (!this.room) return;
    console.log(`[LiveKit] Reconnecting tracks for ${peerId || 'all peers'}...`);
    try {
      this.room.remoteParticipants.forEach((p) => {
        if (!peerId || p.identity === peerId) {
          p.trackPublications.forEach((pub) => {
            if (!pub.isSubscribed) pub.setSubscribed(true);
          });
        }
      });
      this.rebuildPeers();
      this.emit();
    } catch (err) {
      console.warn('[LiveKit] Reconnect error:', err);
    }
  }
}
