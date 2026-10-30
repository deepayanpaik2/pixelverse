'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { VoiceEngine as VoiceEngineType, VoiceParticipantState } from '@/lib/webrtc/voice-engine';
import { useAuth } from '../auth/AuthContext';
import { mockStore } from '@/lib/supabase/mock-store';

export type { VoiceParticipantState };

export interface VoiceState {
  currentRoomId: string | null;
  isVoiceConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  participants: VoiceParticipantState[];
}

export interface VoiceActions {
  joinVoiceRoom: (roomId: string) => Promise<boolean>;
  leaveVoiceRoom: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

export type VoiceContextType = VoiceState & VoiceActions;

const defaultVoiceState: VoiceState = {
  currentRoomId: null,
  isVoiceConnected: false,
  isMuted: false,
  isDeafened: false,
  isSpeaking: false,
  audioLevel: 0,
  participants: [],
};

const defaultVoiceActions: VoiceActions = {
  joinVoiceRoom: async () => false,
  leaveVoiceRoom: () => {},
  toggleMute: () => {},
  toggleDeafen: () => {},
};

const defaultVoiceContext: VoiceContextType = {
  ...defaultVoiceState,
  ...defaultVoiceActions,
};

const VoiceStateContext = createContext<VoiceState | undefined>(undefined);
const VoiceActionsContext = createContext<VoiceActions | undefined>(undefined);
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [participants, setParticipants] = useState<VoiceParticipantState[]>([]);

  const voiceEngineRef = useRef<VoiceEngineType | null>(null);

  useEffect(() => {
    let active = true;
    import('@/lib/webrtc/voice-engine').then(({ VoiceEngine }) => {
      if (!active) return;
      voiceEngineRef.current = new VoiceEngine();
      voiceEngineRef.current.onSpeakingChange((speaking, level) => {
        setIsSpeaking(speaking);
        setAudioLevel(level);

        if (user) {
          setParticipants(prev =>
            prev.map(p => (p.id === user.id ? { ...p, isSpeaking: speaking, audioLevel: level } : p))
          );
        }
      });
    });

    return () => {
      active = false;
      voiceEngineRef.current?.stop();
    };
  }, [user]);

  const joinVoiceRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!voiceEngineRef.current) {
      const { VoiceEngine } = await import('@/lib/webrtc/voice-engine');
      voiceEngineRef.current = new VoiceEngine();
    }

    await voiceEngineRef.current.startLocalAudio();
    setCurrentRoomId(roomId);
    setIsVoiceConnected(true);

    const profiles = mockStore.getProfiles();
    const otherUsers = profiles.filter(p => p.id !== user?.id).slice(0, 3);

    const initialParticipants: VoiceParticipantState[] = [
      ...(user
        ? [
            {
              id: user.id,
              name: user.display_name,
              avatar_url: user.avatar_url,
              isMuted: isMuted,
              isDeafened: isDeafened,
              isSpeaking: false,
              audioLevel: 0,
            },
          ]
        : []),
      ...otherUsers.map((p, idx) => ({
        id: p.id,
        name: p.display_name,
        avatar_url: p.avatar_url,
        isMuted: idx === 1,
        isDeafened: false,
        isSpeaking: false,
        audioLevel: 0,
      })),
    ];

    setParticipants(initialParticipants);
    return true;
  }, [user, isMuted, isDeafened]);

  const leaveVoiceRoom = useCallback(() => {
    voiceEngineRef.current?.stop();
    setCurrentRoomId(null);
    setIsVoiceConnected(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    setParticipants([]);
  }, []);

  const toggleMute = useCallback(() => {
    if (!voiceEngineRef.current) return;
    setIsMuted(prev => {
      const nextMuted = !prev;
      voiceEngineRef.current?.setMute(nextMuted);
      if (user) {
        setParticipants(pList =>
          pList.map(p => (p.id === user.id ? { ...p, isMuted: nextMuted } : p))
        );
      }
      return nextMuted;
    });
  }, [user]);

  const toggleDeafen = useCallback(() => {
    if (!voiceEngineRef.current) return;
    setIsDeafened(prev => {
      const nextDeaf = !prev;
      voiceEngineRef.current?.setDeafen(nextDeaf);
      if (nextDeaf) {
        setIsMuted(true);
      }
      if (user) {
        setParticipants(pList =>
          pList.map(p => (p.id === user.id ? { ...p, isDeafened: nextDeaf, isMuted: nextDeaf || p.isMuted } : p))
        );
      }
      return nextDeaf;
    });
  }, [user]);

  const stateValue: VoiceState = useMemo(() => ({
    currentRoomId,
    isVoiceConnected,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    participants,
  }), [currentRoomId, isVoiceConnected, isMuted, isDeafened, isSpeaking, audioLevel, participants]);

  const actionsValue: VoiceActions = useMemo(() => ({
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
    toggleDeafen,
  }), [joinVoiceRoom, leaveVoiceRoom, toggleMute, toggleDeafen]);

  const combinedValue: VoiceContextType = useMemo(() => ({
    ...stateValue,
    ...actionsValue,
  }), [stateValue, actionsValue]);

  return (
    <VoiceStateContext.Provider value={stateValue}>
      <VoiceActionsContext.Provider value={actionsValue}>
        <VoiceContext.Provider value={combinedValue}>
          {children}
        </VoiceContext.Provider>
      </VoiceActionsContext.Provider>
    </VoiceStateContext.Provider>
  );
}

export function useVoiceState() {
  const context = useContext(VoiceStateContext);
  return context ?? defaultVoiceState;
}

export function useVoiceActions() {
  const context = useContext(VoiceActionsContext);
  return context ?? defaultVoiceActions;
}

export function useVoice() {
  const context = useContext(VoiceContext);
  return context ?? defaultVoiceContext;
}
