import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

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

    // Validate room
    if (!room || typeof room !== 'string') {
      return NextResponse.json({ error: 'Room identifier is required' }, { status: 400 });
    }
    const cleanRoom = room.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 64);
    if (!cleanRoom) {
      return NextResponse.json({ error: 'Invalid room identifier' }, { status: 400 });
    }

    // Validate identity
    if (!identity || typeof identity !== 'string') {
      return NextResponse.json({ error: 'Participant identity is required' }, { status: 400 });
    }
    const cleanIdentity = identity.trim().slice(0, 128);
    if (!cleanIdentity) {
      return NextResponse.json({ error: 'Invalid participant identity' }, { status: 400 });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 40) : 'Guest';
    const cleanColor = typeof color === 'string' && color.startsWith('#') ? color.slice(0, 7) : '#00f0ff';

    // LiveKit credentials
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl =
      process.env.LIVEKIT_URL ||
      process.env.NEXT_PUBLIC_LIVEKIT_URL ||
      'wss://deep-pixelverse-3ap1vw7o.livekit.cloud';

    if (!apiKey || !apiSecret || apiKey === '<my_rotated_livekit_api_key>' || apiKey === 'your_livekit_api_key') {
      console.warn(
        `[LiveKit Token] Missing or placeholder credentials for room: ${cleanRoom}. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env.local`
      );
      return NextResponse.json(
        {
          error: 'LiveKit Cloud credentials not configured. Please add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to your .env.local or deployment environment variables.',
          missingConfig: true,
        },
        { status: 503 }
      );
    }

    // Generate short-lived (4 hours) access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: cleanIdentity,
      name: cleanName,
      metadata: JSON.stringify({
        color: cleanColor,
        isHost: Boolean(isHost),
      }),
      ttl: '4h',
    });

    at.addGrant({
      room: cleanRoom,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // Safe diagnostic log (never log secrets or tokens)
    console.log(`[LiveKit Token] Issued token for participant "${cleanIdentity}" in room "${cleanRoom}"`);

    return NextResponse.json({
      token,
      url: livekitUrl,
      room: cleanRoom,
      identity: cleanIdentity,
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

  if (!room || !identity) {
    return NextResponse.json(
      { error: 'room and identity query parameters are required for GET' },
      { status: 400 }
    );
  }

  // Delegate to POST logic
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, identity, name, color, isHost }),
    })
  );
}
