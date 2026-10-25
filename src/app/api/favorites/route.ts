import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';
    const favorites = mockStore.getFavorites(userId);
    return NextResponse.json({ favorites });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get favorites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, userId } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    const actorKey = userId || 'guest';
    const isFav = mockStore.toggleFavorite(actorKey, gameId);

    return NextResponse.json({ isFav, favorites: mockStore.getFavorites(actorKey) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
