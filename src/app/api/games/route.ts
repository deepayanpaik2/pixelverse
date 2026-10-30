export const revalidate = 300;
import { NextResponse } from 'next/server';
import { FEATURED_GAMES, CATEGORIES, gameInCategory } from '@/lib/games';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const category = searchParams.get('category')?.trim() || '';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const tag = searchParams.get('tag')?.trim().toLowerCase() || '';
    const sort = searchParams.get('sort') || 'quality';

    let result = FEATURED_GAMES;

    if (category && category !== 'All') {
      result = result.filter(g => gameInCategory(g, category));
    }

    if (tag) {
      result = result.filter(g => g.tags.some(t => t.toLowerCase() === tag));
    }

    if (search) {
      result = result.filter(g => 
        g.title.toLowerCase().includes(search) ||
        g.category.toLowerCase().includes(search) ||
        g.description.toLowerCase().includes(search) ||
        g.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    if (sort === 'newest') {
      result = [...result].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } else if (sort === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'plays') {
      result = [...result].sort((a, b) => b.play_count - a.play_count);
    } else if (sort === 'random' || searchParams.get('random') === 'true') {
      result = [...result].sort(() => Math.random() - 0.5);
    } else if (sort === 'rating') {
      result = [...result].sort((a, b) => b.rating_score - a.rating_score || (b.quality_score || 0) - (a.quality_score || 0));
    }

    const total = result.length;
    const slice = result.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
      games: slice.map(g => ({
        id: g.id,
        slug: g.slug,
        title: g.title,
        category: g.category,
        description: g.description,
        thumbnail_url: g.thumbnail_url,
        embed_url: g.embed_url,
        rating_score: g.rating_score,
        orientation: g.orientation,
        width: g.width,
        height: g.height,
        play_count: g.play_count,
        likes_count: g.likes_count,
      })),
      categories: CATEGORIES.slice(0, 15).map(c => ({ id: c.id, name: c.name, slug: c.slug, count: c.game_count })),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch games' }, { status: 500 });
  }
}
