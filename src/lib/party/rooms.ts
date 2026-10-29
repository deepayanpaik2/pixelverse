/**
 * Party rooms: database helpers (Supabase) + guest/user identity.
 * Rooms work for guests too, so identity lives in localStorage.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface PartyRoom {
  id: string;
  code: string;
  name: string;
  description: string;
  host_client_id: string;
  host_name: string;
  visibility: 'public' | 'unlisted' | 'private';
  max_participants: number;
  selected_game_id: string | null;
  member_count: number;
  is_closed: boolean;
  created_at: string;
  last_active_at: string;
}

export interface Identity {
  clientId: string; // stable per browser, used to recognise the host
  name: string;
  color: string;
}

export interface SavedMessage {
  id: string;
  client_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

const COLORS = ['#00f0ff', '#39ff14', '#ff0055', '#9d4edd', '#ffbe0b', '#ff7a00', '#4cc9f0', '#f72585'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

const STORAGE_KEY_ROOMS = 'playverse_party_rooms';

function loadStoredRooms(): PartyRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS);
    if (!raw) return [];
    const parsed: PartyRoom[] = JSON.parse(raw);
    const cutoff = Date.now() - 30 * 60 * 1000; // clean up rooms older than 30 mins
    return parsed.filter(r => !r.is_closed && new Date(r.last_active_at || r.created_at).getTime() > cutoff);
  } catch {
    return [];
  }
}

function saveStoredRooms(rooms: PartyRoom[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms.slice(0, 50)));
  } catch {}
}

let inMemoryRooms: PartyRoom[] = loadStoredRooms();
let inMemoryMessages: Record<string, SavedMessage[]> = {};

export function roomsBackendReady(): boolean {
  return true;
}

export function generateRoomCode(length = 6): string {
  let out = '';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getIdentity(displayName?: string | null): Identity {
  let clientId = '';
  let guestName = '';
  try {
    clientId = localStorage.getItem('pv_client_id') || '';
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('pv_client_id', clientId);
    }
    guestName = localStorage.getItem('pv_guest_name') || '';
    if (!guestName) {
      guestName = 'Guest-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('pv_guest_name', guestName);
    }
  } catch {
    clientId = clientId || crypto.randomUUID();
    guestName = guestName || 'Guest-' + Math.floor(1000 + Math.random() * 9000);
  }
  return {
    clientId,
    name: (displayName || guestName).slice(0, 24),
    color: COLORS[hashString(clientId) % COLORS.length],
  };
}

export function saveGuestName(name: string) {
  try {
    localStorage.setItem('pv_guest_name', name.slice(0, 24));
  } catch {
    /* ignore */
  }
}

export function normalizeCode(code: string): string {
  return decodeURIComponent(code).trim().toUpperCase();
}

export async function createRoom(input: {
  name: string;
  description: string;
  visibility: 'public' | 'unlisted' | 'private';
  maxParticipants: number;
  gameId: string | null;
  identity: Identity;
}): Promise<PartyRoom> {
  if (isSupabaseConfigured()) {
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data, error } = await supabase
          .from('party_rooms')
          .insert({
            code: generateRoomCode(),
            name: input.name.slice(0, 60),
            description: input.description.slice(0, 160),
            visibility: input.visibility,
            max_participants: Math.min(12, Math.max(2, input.maxParticipants)),
            selected_game_id: input.gameId,
            host_client_id: input.identity.clientId,
            host_name: input.identity.name,
            member_count: 0,
          })
          .select()
          .single();

        if (!error && data) return data as PartyRoom;
        if (error && error.code !== '23505') break;
      }
    } catch {}
  }

  // Fallback to in-memory room
  const localRoom: PartyRoom = {
    id: 'room-' + Date.now(),
    code: generateRoomCode(),
    name: input.name.slice(0, 60),
    description: input.description.slice(0, 160),
    visibility: input.visibility,
    max_participants: Math.min(12, Math.max(2, input.maxParticipants)),
    selected_game_id: input.gameId,
    host_client_id: input.identity.clientId,
    host_name: input.identity.name,
    member_count: 1,
    is_closed: false,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  };
  inMemoryRooms.unshift(localRoom);
  saveStoredRooms(inMemoryRooms);
  return localRoom;
}

export async function listPublicRooms(gameId?: string | null): Promise<PartyRoom[]> {
  if (isSupabaseConfigured()) {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      let query = supabase
        .from('party_rooms')
        .select('*')
        .eq('visibility', 'public')
        .eq('is_closed', false)
        .gt('last_active_at', since);

      if (gameId) {
        query = query.eq('selected_game_id', gameId);
      }

      const { data, error } = await query
        .order('member_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        return data as PartyRoom[];
      }
    } catch {}
  }

  // Fallback to real locally created rooms (never fake bot rooms)
  const stored = loadStoredRooms();
  return stored.filter(r => {
    if (r.is_closed || r.visibility !== 'public') return false;
    const activeTime = new Date(r.last_active_at || r.created_at).getTime();
    if (Date.now() - activeTime > 15 * 60 * 1000) return false;
    if (gameId && r.selected_game_id !== gameId) return false;
    return true;
  });
}

export async function getRoomByCode(code: string): Promise<PartyRoom | null> {
  const norm = normalizeCode(code);
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('party_rooms')
        .select('*')
        .eq('code', norm)
        .maybeSingle();
      if (!error && data) return data as PartyRoom;
    } catch {}
  }
  return inMemoryRooms.find(r => r.code === norm) || null;
}

export async function heartbeat(code: string, count: number): Promise<void> {
  const norm = normalizeCode(code);
  const found = inMemoryRooms.find(r => r.code === norm);
  if (found) {
    found.last_active_at = new Date().toISOString();
    found.member_count = count;
    saveStoredRooms(inMemoryRooms);
  }
  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('party_room_heartbeat', { p_code: norm, p_count: count });
    } catch {}
  }
}

export async function closeRoom(code: string, clientId: string): Promise<void> {
  const norm = normalizeCode(code);
  const found = inMemoryRooms.find(r => r.code === norm);
  if (found && found.host_client_id === clientId) {
    found.is_closed = true;
    saveStoredRooms(inMemoryRooms);
  }
  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('close_party_room', { p_code: norm, p_client_id: clientId });
    } catch {}
  }
}

export async function loadMessages(code: string): Promise<SavedMessage[]> {
  const norm = normalizeCode(code);
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('party_messages')
        .select('id, client_id, sender_name, body, created_at')
        .eq('room_code', norm)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data && data.length > 0) {
        return (data as SavedMessage[]).reverse();
      }
    } catch {}
  }
  return inMemoryMessages[norm] || [];
}

export async function saveMessage(code: string, id: string, clientId: string, name: string, body: string): Promise<void> {
  const norm = normalizeCode(code);
  const msg: SavedMessage = {
    id,
    client_id: clientId,
    sender_name: name.slice(0, 40),
    body: body.slice(0, 500),
    created_at: new Date().toISOString(),
  };
  if (!inMemoryMessages[norm]) inMemoryMessages[norm] = [];
  inMemoryMessages[norm].push(msg);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('party_messages').insert({
        id,
        room_code: norm,
        client_id: clientId,
        sender_name: name.slice(0, 40),
        body: body.slice(0, 500),
      });
    } catch {}
  }
}
