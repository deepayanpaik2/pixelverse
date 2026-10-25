import { NextResponse } from 'next/server';
import { FEATURED_GAMES, CATEGORIES } from '@/lib/games';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const startTime = Date.now();

export async function GET() {
  const isReal = isSupabaseConfigured();
  return NextResponse.json({
    status: 'healthy',
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    catalog: {
      total_games: FEATURED_GAMES.length,
      categories_count: CATEGORIES.length,
      feed_provider: 'GamePix HTML5 Catalog',
      sid: process.env.NEXT_PUBLIC_GAMEPIX_SID || '771E7',
    },
    backend: {
      supabase_configured: !!isReal,
      database_mode: isReal ? 'supabase' : 'local-resilient-store',
      webrtc_voice_ready: true,
      party_rooms_ready: true,
    },
    version: '1.0.0',
  }, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}
