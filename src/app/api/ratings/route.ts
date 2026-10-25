import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, isLike, userId } = body;

    if (!gameId || isLike === undefined) {
      return NextResponse.json({ error: 'Missing gameId or isLike' }, { status: 400 });
    }

    const actorKey = userId || 'guest';
    const result = mockStore.rateGame(gameId, isLike, userId, actorKey);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rate game' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId') || undefined;

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    const actorKey = userId || 'guest';
    const rating = mockStore.getUserGameRating(gameId, userId, actorKey);

    return NextResponse.json({ userRating: rating });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get rating' }, { status: 500 });
  }
}
