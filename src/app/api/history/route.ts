import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';
    const history = mockStore.getHistory(userId);
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameSlug, userId } = body;

    if (!gameSlug) {
      return NextResponse.json({ error: 'Missing gameSlug' }, { status: 400 });
    }

    const actorKey = userId || 'guest';
    mockStore.recordPlayedGame(actorKey, gameSlug);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record play' }, { status: 500 });
  }
}
