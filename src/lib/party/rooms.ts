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

const LOCAL_SEED_ROOMS: PartyRoom[] = [
  {
    id: 'room-1',
    code: 'RETRO9',
    name: 'Retro Speedruns & High Scores',
    description: 'Chasing high scores together in classic arcade challenges. Voice chat open!',
    host_client_id: 'host-1',
    host_name: 'Play Master',
    visibility: 'public',
    max_participants: 8,
    selected_game_id: '737HCH',
    member_count: 3,
    is_closed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    last_active_at: new Date().toISOString(),
  },
  {
    id: 'room-2',
    code: 'PUZZ42',
    name: 'Chill Puzzle & Logic Co-Op',
    description: 'Casual relaxing puzzle runs with fellow gamers.',
    host_client_id: 'host-2',
    host_name: 'Neon Runner',
    visibility: 'public',
    max_participants: 6,
    selected_game_id: '737HCH',
    member_count: 2,
    is_closed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    last_active_at: new Date().toISOString(),
  },
  {
    id: 'room-3',
    code: 'ARENA7',
    name: 'Multiplayer Arena Showdown',
    description: 'Live competitive battles. Grab your keyboard and fight for the top spot!',
    host_client_id: 'host-3',
    host_name: 'Pixel Valkyrie',
    visibility: 'public',
    max_participants: 8,
    selected_game_id: '737HCH',
    member_count: 4,
    is_closed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    last_active_at: new Date().toISOString(),
  },
];

let inMemoryRooms: PartyRoom[] = [...LOCAL_SEED_ROOMS];
let inMemoryMessages: Record<string, SavedMessage[]> = {
  RETRO9: [
    { id: 'm1', client_id: 'host-1', sender_name: 'Play Master', body: 'Welcome to the party room! Ready to play?', created_at: new Date(Date.now() - 60000).toISOString() },
  ],
};

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
  return localRoom;
}

export async function listPublicRooms(): Promise<PartyRoom[]> {
  if (isSupabaseConfigured()) {
    try {
      const since = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('party_rooms')
        .select('*')
        .eq('visibility', 'public')
        .eq('is_closed', false)
        .gt('last_active_at', since)
        .order('member_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data && data.length > 0) return data as PartyRoom[];
    } catch {}
  }
  return inMemoryRooms.filter(r => !r.is_closed && r.visibility === 'public');
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
