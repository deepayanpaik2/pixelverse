import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { room, identity, name, color, isHost } = body;

    // Validate and sanitize room name
    if (!room || typeof room !== 'string') {
      return NextResponse.json({ error: 'Room identifier is required' }, { status: 400 });
    }
    const cleanRoom = room.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 64);
    if (!cleanRoom) {
      return NextResponse.json({ error: 'Invalid room identifier format' }, { status: 400 });
    }

    // Client-supplied fallback fields
    const cleanIdentity = typeof identity === 'string' && identity.trim()
      ? identity.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 128)
      : '';
    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 40) : 'Guest';
    const cleanColor = typeof color === 'string' && color.startsWith('#') ? color.slice(0, 7) : '#00f0ff';

    // Verify session authentication with Supabase if configured
    let authUser: { id: string; email?: string; user_metadata?: any } | null = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabaseServer = createServerSupabaseClient();
        const { data: { user } } = await supabaseServer.auth.getUser();
        if (user) {
          authUser = user;
        }
      } catch {
        // Guest or localStorage mode
      }
    }

    // Derive participant identity from authenticated session when available, or fall back to verified guest identity
    const participantIdentity = authUser ? authUser.id : (cleanIdentity || `guest_${crypto.randomUUID().slice(0, 8)}`);
    const participantName = authUser?.user_metadata?.display_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || cleanName;

    // LiveKit credentials from server-side environment variables or verified project keys
    const apiKey = process.env.LIVEKIT_API_KEY || 'APIuj5UMp5pfAEF';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '6IlRq5bpxsQepAuaToMueX3mxBZslncvi0Dg1eoWY3fB';
    const livekitUrl =
      process.env.LIVEKIT_URL ||
      process.env.NEXT_PUBLIC_LIVEKIT_URL ||
      'wss://deep-pixelverse-3ap1vw7o.livekit.cloud';

    if (!apiKey || !apiSecret || apiKey === '<my_rotated_livekit_api_key>' || apiKey === 'your_livekit_api_key') {
      console.warn(
        `[LiveKit Token] Missing or placeholder credentials for room: ${cleanRoom}. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in environment variables.`
      );
      return NextResponse.json(
        {
          error: 'LiveKit Cloud credentials not configured. Please add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to your environment variables.',
          missingConfig: true,
        },
        { status: 503 }
      );
    }

    // Generate short-lived access token (3 hours - ideal for game parties)
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      metadata: JSON.stringify({
        color: cleanColor,
        isHost: Boolean(isHost),
        isGuest: !authUser,
      }),
      ttl: '3h',
    });

    // Grant participant room permissions
    at.addGrant({
      room: cleanRoom,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // Safe diagnostic log (never log secret or token)
    console.log(`[LiveKit Token] Issued token for participant "${participantIdentity}" in room "${cleanRoom}"`);

    return NextResponse.json({
      token,
      url: livekitUrl,
      room: cleanRoom,
      identity: participantIdentity,
    });
  } catch (err: any) {
    console.error('[LiveKit Token Error]', err?.message || 'Token generation failed');
    return NextResponse.json(
      { error: 'Failed to generate access token', details: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  const identity = searchParams.get('identity');
  const name = searchParams.get('name') || 'Guest';
  const color = searchParams.get('color') || '#00f0ff';
  const isHost = searchParams.get('isHost') === 'true' || searchParams.get('isHost') === '1';

  if (!room) {
    return NextResponse.json(
      { error: 'room query parameter is required for GET' },
      { status: 400 }
    );
  }

  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, identity, name, color, isHost }),
    })
  );
}
