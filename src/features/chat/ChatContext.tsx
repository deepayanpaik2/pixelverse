'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Conversation, Message } from '@/types';
import { mockStore } from '@/lib/supabase/mock-store';
import { useAuth } from '../auth/AuthContext';

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
}

export interface ChatActions {
  setActiveConversationId: (id: string) => void;
  sendMessage: (content: string, replyToId?: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  refreshMessages: () => void;
}

export type ChatContextType = ChatState & ChatActions;

const defaultChatState: ChatState = {
  conversations: [],
  activeConversationId: null,
  activeConversation: null,
  messages: [],
};

const defaultChatActions: ChatActions = {
  setActiveConversationId: () => {},
  sendMessage: () => {},
  addReaction: () => {},
  refreshMessages: () => {},
};

const defaultChatContext: ChatContextType = {
  ...defaultChatState,
  ...defaultChatActions,
};

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatActionsContext = createContext<ChatActions | undefined>(undefined);
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;
    const convs = mockStore.getConversations(user.id);
    setConversations(convs);
    if (convs.length > 0 && !activeConversationId) {
      setActiveConversationIdState(convs[0].id);
    }
  }, [user, activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const msgs = mockStore.getMessages(activeConversationId);
    setMessages(msgs);
  }, [activeConversationId]);

  const setActiveConversationId = useCallback((id: string) => {
    setActiveConversationIdState(id);
  }, []);

  const refreshMessages = useCallback(() => {
    if (activeConversationId) {
      setMessages(mockStore.getMessages(activeConversationId));
    }
    if (user) {
      setConversations(mockStore.getConversations(user.id));
    }
  }, [activeConversationId, user]);

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!activeConversationId || !user || !content.trim()) return;
    mockStore.sendMessage(activeConversationId, user.id, content.trim(), replyToId);
    refreshMessages();
  }, [activeConversationId, user, refreshMessages]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!user) return;
    mockStore.addReaction(messageId, user.id, emoji);
    refreshMessages();
  }, [user, refreshMessages]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const stateValue: ChatState = useMemo(() => ({
    conversations,
    activeConversationId,
    activeConversation,
    messages,
  }), [conversations, activeConversationId, activeConversation, messages]);

  const actionsValue: ChatActions = useMemo(() => ({
    setActiveConversationId,
    sendMessage,
    addReaction,
    refreshMessages,
  }), [setActiveConversationId, sendMessage, addReaction, refreshMessages]);

  const combinedValue: ChatContextType = useMemo(() => ({
    ...stateValue,
    ...actionsValue,
  }), [stateValue, actionsValue]);

  return (
    <ChatStateContext.Provider value={stateValue}>
      <ChatActionsContext.Provider value={actionsValue}>
        <ChatContext.Provider value={combinedValue}>
          {children}
        </ChatContext.Provider>
      </ChatActionsContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChatState() {
  const context = useContext(ChatStateContext);
  return context ?? defaultChatState;
}

export function useChatActions() {
  const context = useContext(ChatActionsContext);
  return context ?? defaultChatActions;
}

export function useChat() {
  const context = useContext(ChatContext);
  return context ?? defaultChatContext;
}
