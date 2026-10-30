'use client';

import React from 'react';
import { VoiceProvider } from '@/features/voice/VoiceContext';
import { ChatProvider } from '@/features/chat/ChatContext';

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return (
    <VoiceProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </VoiceProvider>
  );
}
