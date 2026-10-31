import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302',
  'stun:stun.cloudflare.com:3478',
  'stun:global.stun.twilio.com:3478',
  'stun:stun.relay.metered.ca:80',
  'stun:stun.schlund.de:3478',
  'stun:stun.voipbuster.com:3478',
  'stun:stun.1und1.de:3478',
  'stun:stun.gmx.net:3478',
];

export async function GET() {
  const iceServers: RTCIceServer[] = [
    { urls: DEFAULT_STUN_SERVERS },
  ];

  // If TURN_URL or NEXT_PUBLIC_TURN_URL is configured in environment variables
  const turnUrl = process.env.TURN_URL || process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl.split(',').map((u) => u.trim()),
      username: process.env.TURN_USERNAME || process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.TURN_CREDENTIAL || process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
    });
  }

  // If Metered API credentials are configured in server environment
  const meteredDomain = process.env.METERED_DOMAIN;
  const meteredApiKey = process.env.METERED_API_KEY;
  if (meteredDomain && meteredApiKey) {
    try {
      const res = await fetch(`https://${meteredDomain}/api/v1/turn/credentials?apiKey=${meteredApiKey}`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const dynamicServers = await res.json();
        if (Array.isArray(dynamicServers) && dynamicServers.length > 0) {
          return NextResponse.json(dynamicServers, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
          });
        }
      }
    } catch {
      /* fall back to static list */
    }
  }

  // Fallback public / free open relays (TCP port 443 + UDP port 80/443 for NAT/firewall traversal)
  iceServers.push({
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp',
      'turns:openrelay.metered.ca:443?transport=tcp',
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject',
  });

  return NextResponse.json(iceServers, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
