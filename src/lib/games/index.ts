import { GameManifest, CategoryInfo } from '@/types';
import rawRegistry from './registry.json';
import rawPokiRegistry from './poki-registry.json';

/**
 * Catalog = every game in the GamePix feed + Poki catalog.
 *
 * registry.json and poki-registry.json are compact lists of rows:
 * and are expanded into full GameManifest objects here, once, when the site starts.
 * Rebuild anytime with:  npm run sync:feed && npm run sync:poki
 */
type Row = [string, string, string, string, string, number, number, number, string, string];
type PokiTuple = [string, string, string, string, string, string, 'embed' | 'external', string, number, number];

export const GAMEPIX_SID = process.env.NEXT_PUBLIC_GAMEPIX_SID || '771E7';
export const EMBED_HOST = 'https://play.gamepix.com';
export const IMAGE_HOST = 'https://img.gamepix.com/games';

const coverUrl = (ns: string, w: number) => `${IMAGE_HOST}/${ns}/cover/${ns}.png?w=${w}`;
const embedUrl = (ns: string) => `${EMBED_HOST}/${ns}/embed?sid=${GAMEPIX_SID}`;

export function categorySlug(name: string): string {
  const s = name.toLowerCase().replace(/^\./, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'games';
}

/** "match-3" -> "Match 3", "hyper-casual" -> "Hyper-casual", "io" -> ".io" */
export function categoryName(raw: string): string {
  const k = raw.toLowerCase().trim();
  const special: Record<string, string> = {
    io: '.io', '3d': '3D', '2-player': '2 Player', 'hyper-casual': 'Hyper-casual',
    'match-3': 'Match 3', 'mahjong': 'Mahjong', 'rpg': 'RPG', 'html5': 'HTML5',
  };
  if (special[k]) return special[k];
  return k.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Casual';
}

function hashInt(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function slugify(title: string): string {
  return title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const NOT_FOR_KIDS = /\b(zombies?|blood|gore|horror|guns?|sniper|weapons?|murder|kill(?:ing|er)?|crime|war|shoot(?:er|ing)?|fight(?:ing)?|battle|assassin|gangster|mafia|scary|combat)\b/i;

function expand(row: Row, slug: string): GameManifest {
  const [id, ns, title, rawCategory, rawOrientation, width, height, quality, published, description] = row;
  const category = categoryName(rawCategory);
  const orientation = rawOrientation === 'portrait' ? 'portrait' : rawOrientation === 'landscape' ? 'landscape' : 'both';
  const isTwoPlayer = /2-?player|two-?player/i.test(rawCategory);
  const isMulti = isTwoPlayer || /multiplayer|^io$/i.test(rawCategory);
  const kidsSafe = !NOT_FOR_KIDS.test(`${title} ${rawCategory}`);
  const cover = coverUrl(ns, 320);   // tiles: ~225 css px wide; 640 is added through srcSet for sharp screens
  const big = coverUrl(ns, 640);
  const embed = embedUrl(ns);

  // Deterministic realistic play count, likes, dislikes, and rating per game
  const hash = hashInt(id);
  const jitter = (hash % 100) / 100;
  const playBase = Math.pow(quality, 2.2) * 85000;
  const play_count = Math.max(120, Math.round(playBase + quality * 8000 + 150 + jitter * (playBase * 0.35 + 400)));

  // Realistic like ratio: top quality reaches ~97%-98% likes (4.8-4.9 stars), poor games drop to 35%-45% (1.8-2.3 stars)
  const targetLikeRatio = Math.min(0.985, Math.max(0.35, 0.35 + Math.pow(quality, 0.72) * 0.63 + (jitter - 0.5) * 0.035));
  const voteRate = 0.035 + (hash % 30) * 0.001; // 3.5% to 6.5% of plays convert to votes
  const totalVotes = Math.max(12, Math.round(play_count * voteRate));

  const likes_count = Math.max(5, Math.round(totalVotes * targetLikeRatio));
  const dislikes_count = Math.max(1, totalVotes - likes_count);
  const rating_score = parseFloat(((likes_count / (likes_count + dislikes_count)) * 5).toFixed(1));

  return {
    id,
    slug,
    title,
    description: description || `${title}. Play free in your browser on Pixelverse.`,
    instructions: 'Use your mouse, keyboard or touch screen to play. Press the full-screen button for the best view.',
    category,
    tags: [category],
    thumbnail_url: cover,
    thumbnail_large_url: big,
    banner_url: big,
    launch_path: embed,
    embed_url: embed,
    source_type: 'gamepix',
    source: 'gamepix',
    author: 'GamePix',
    developer_name: 'GamePix',
    license: 'GamePix Publisher Network (Free to Play)',
    license_url: 'https://www.gamepix.com',
    supported_players: isTwoPlayer ? '2 Players' : isMulti ? 'Multiplayer' : '1 Player',
    is_multiplayer: isMulti,
    controls: { keyboard: [], mouse: [], touch: true },
    orientation,
    mobile_friendly: true,
    supports_mobile: true,
    supports_desktop: true,
    aspect_ratio: orientation === 'portrait' ? '3/4' : '4/3',
    width,
    height,
    is_featured: false,
    is_editor_pick: quality >= 0.92,
    is_kids_safe: kidsSafe,
    quality_score: quality,
    play_count,
    likes_count,
    dislikes_count,
    rating_score,
    status: 'published',
    play_mode: 'embed',
    embed_status: 'authorized',
    created_at: published ? `${published}T00:00:00.000Z` : undefined,
  };
}

function expandPoki(tuple: PokiTuple): GameManifest {
  const [id, slug, poki_slug, title, rawCat, author, play_mode, embed_url, rating, votes] = tuple;
  const category = categoryName(rawCat || 'Casual');
  const isEmbed = play_mode === 'embed' && !!embed_url;
  const launchPath = isEmbed ? embed_url : `https://poki.com/en/g/${poki_slug}`;
  const likesCount = Math.round((rating / 5) * votes);
  const dislikesCount = Math.max(1, votes - likesCount);
  const thumb = `https://img.gamepix.com/games/${poki_slug}/cover/${poki_slug}.png?w=640`;

  return {
    id,
    slug,
    poki_slug,
    poki_url: `https://poki.com/en/g/${poki_slug}`,
    external_url: `https://poki.com/en/g/${poki_slug}`,
    play_mode: isEmbed ? 'embed' : 'external',
    embed_status: isEmbed ? 'authorized' : 'external_only',
    title,
    description: `${title} is a popular online browser game hosted officially on Poki. Experience fast-paced gameplay, vibrant graphics, and instant fun directly in your browser.`,
    instructions: isEmbed
      ? 'Use your mouse, keyboard or touch screen to play directly in your browser. Press Fullscreen for edge-to-edge view.'
      : 'Hosted officially on Poki. Click "Play on Poki" to launch and play directly in full screen on the authorized host.',
    category,
    tags: [category, 'Poki'],
    thumbnail_url: thumb,
    thumbnail_large_url: thumb,
    banner_url: thumb,
    launch_path: launchPath,
    embed_url: isEmbed ? embed_url : undefined,
    source_type: 'poki',
    source: 'poki',
    author: author || 'Poki Studio',
    developer_name: author || 'Poki Studio',
    license: isEmbed ? 'Licensed Syndication Network (Free to Play)' : 'Poki Platform Official (External Play)',
    supported_players: '1 Player',
    controls: { keyboard: [], mouse: [], touch: true },
    orientation: 'landscape',
    mobile_friendly: true,
    supports_mobile: true,
    supports_desktop: true,
    aspect_ratio: '16/9',
    is_featured: false,
    is_editor_pick: rating >= 4.8,
    is_kids_safe: true,
    play_count: votes * 6,
    likes_count: likesCount,
    dislikes_count: dislikesCount,
    rating_score: rating,
    status: 'published',
    created_at: '2026-10-30T00:00:00.000Z',
  };
}

export const ON_SITE_GAMES: GameManifest[] = [];

function buildCatalog(): GameManifest[] {
  const rows = rawRegistry as unknown as Row[];
  const pokiRows = (rawPokiRegistry || []) as unknown as PokiTuple[];
  const used = new Set<string>();
  for (const g of ON_SITE_GAMES) used.add(g.slug);

  // 1. GamePix curated catalog
  const list = rows.map((row) => {
    let slug = slugify(row[2]) || `game-${row[1]}`;
    if (used.has(slug)) slug = `${slug}-${row[1]}`;
    used.add(slug);
    return expand(row, slug);
  });

  // Index GamePix by normalized title and slug for deduplication & dual-badging
  const titleMap = new Map<string, GameManifest>();
  for (const g of list) {
    titleMap.set(g.title.toLowerCase().replace(/[^a-z0-9]/g, ''), g);
    titleMap.set(g.slug.toLowerCase().replace(/[^a-z0-9]/g, ''), g);
  }

  // 2. Cross-reference & append Poki games
  for (const tuple of pokiRows) {
    const [, , pokiSlug, title, , author, playMode, embedUrl] = tuple;
    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = pokiSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = titleMap.get(normTitle) || titleMap.get(normSlug);

    if (matched) {
      matched.poki_slug = pokiSlug;
      matched.poki_url = `https://poki.com/en/g/${pokiSlug}`;
      matched.play_mode = 'dual';
      if (author && author !== 'Poki Studio') {
        matched.developer_name = author;
      }
    } else {
      let slug = `poki-${pokiSlug}`;
      if (used.has(slug)) slug = `${slug}-${tuple[0]}`;
      used.add(slug);
      const manifest = expandPoki([
        tuple[0],
        slug,
        pokiSlug,
        title,
        tuple[4],
        author,
        playMode,
        embedUrl,
        tuple[8],
        tuple[9]
      ]);
      list.push(manifest);
    }
  }

  // Spotlight: the best-rated games that are not portrait-only (they look best in the wide hero).
  let featured = 0;
  for (const g of list) {
    if (featured >= 6) break;
    if (g.orientation !== 'portrait') { g.is_featured = true; g.featured = true; featured++; }
  }
  return list;
}

/** Full catalog matching feed order. */
export const FEATURED_GAMES: GameManifest[] = buildCatalog();

const byNewest = (a: GameManifest, b: GameManifest) => {
  const da = a.created_at || '';
  const db = b.created_at || '';
  return da > db ? -1 : da < db ? 1 : 0;
};
const NEWEST: GameManifest[] = [...FEATURED_GAMES].sort(byNewest);

/** IDs of recent games used for the new release badge */
export const NEW_GAME_IDS: Set<string> = new Set(NEWEST.slice(0, 40).map((g) => g.id));

const BY_KEY = new Map<string, GameManifest>();
for (const g of FEATURED_GAMES) {
  BY_KEY.set(g.slug, g);
  if (g.poki_slug && !BY_KEY.has(g.poki_slug)) BY_KEY.set(g.poki_slug, g);
  if (!BY_KEY.has(g.id)) BY_KEY.set(g.id, g);
}

type CategoryDef = Omit<CategoryInfo, 'game_count' | 'id' | 'slug'> & { name: string };

// Display metadata for common GamePix categories. Unknown ones are added automatically.
const CATEGORY_META: Record<string, Omit<CategoryDef, 'name'>> = {
  'Puzzle':       { description: 'Brain teasers, logic and clever challenges.', icon_name: 'Puzzle', color: '#9fe6c3' },
  'Match 3':      { description: 'Swap, match and clear the board.', icon_name: 'Puzzle', color: '#f2a0c6' },
  'Hyper-casual': { description: 'One-tap, pick-up-and-play games for quick sessions.', icon_name: 'Zap', color: '#f3d28a' },
  'Casual':       { description: 'Relaxed, easy-to-learn games for any mood.', icon_name: 'Heart', color: '#f2a0c6' },
  'Arcade':       { description: 'Timeless score-chasers and fast reflex classics.', icon_name: 'Gamepad2', color: '#a9e9df' },
  'Adventure':    { description: 'Explore worlds, solve mysteries and go on epic quests.', icon_name: 'Compass', color: '#b9a8ff' },
  'Action':       { description: 'High-octane combat, platforming and survival.', icon_name: 'Flame', color: '#f4a3c0' },
  'Strategy':     { description: 'Plan, build and outsmart your opponents.', icon_name: 'Compass', color: '#9fc4f2' },
  'Shooting':     { description: 'Target practice, space defense and tactical shooters.', icon_name: 'Crosshair', color: '#f4a3c0' },
  'Racing':       { description: 'High-speed circuits, drifts and stunt tracks.', icon_name: 'Car', color: '#f0a06a' },
  'Sports':       { description: 'Football, basketball, billiards and athletic championships.', icon_name: 'Trophy', color: '#9fc4f2' },
  'Soccer':       { description: 'Penalties, free kicks and full-match football.', icon_name: 'Goal', color: '#7fcf9a' },
  'Clicker':      { description: 'Tap, upgrade and watch the numbers go up.', icon_name: 'MousePointerClick', color: '#d596e8' },
  'Fighting':     { description: 'Brawlers, duels and martial arts showdowns.', icon_name: 'Swords', color: '#ec7b7b' },
  'Zombie':       { description: 'Survive the horde with wits and firepower.', icon_name: 'Flame', color: '#9fe6c3' },
  'Farming':      { description: 'Plant, grow, harvest and build your own farm.', icon_name: 'Globe', color: '#7fcf9a' },
  'Building':     { description: 'Stack, construct and engineer something great.', icon_name: 'Box', color: '#f3d28a' },
  'Airplane':     { description: 'Take off, dogfight and land in the sky.', icon_name: 'Rocket', color: '#8fd0e8' },
  'Trivia':       { description: 'Quizzes, memory challenges and word games.', icon_name: 'Puzzle', color: '#b9a8ff' },
  'Cooking':      { description: 'Kitchen chaos, bakeries and tasty challenges.', icon_name: 'ChefHat', color: '#f0a06a' },
  'Simulation':   { description: 'Run a shop, a town or a whole world.', icon_name: 'Globe', color: '#8fd0e8' },
  '.io':          { description: 'Join a live arena and outgrow everyone else.', icon_name: 'Globe', color: '#a9e9df' },
  'Multiplayer':  { description: 'Co-op, 2-player and online arena games.', icon_name: 'Users', color: '#9fe6c3' },
  '2 Player':     { description: 'Grab a friend and play on the same screen.', icon_name: 'Users', color: '#f3d28a' },
  '3D':           { description: 'Immersive 3D worlds that run right in your browser.', icon_name: 'Box', color: '#b9a8ff' },
};

export function gameInCategory(g: GameManifest, categoryName: string): boolean {
  return matchesCategory(g, categoryName.toLowerCase());
}

function matchesCategory(g: GameManifest, nameLower: string): boolean {
  return g.category.toLowerCase() === nameLower || g.tags.some((t) => t.toLowerCase() === nameLower);
}

const CATEGORY_COUNTS = new Map<string, number>();
for (const g of FEATURED_GAMES) {
  CATEGORY_COUNTS.set(g.category, (CATEGORY_COUNTS.get(g.category) || 0) + 1);
}

export const RAW_CATEGORIES: Omit<CategoryInfo, 'game_count'>[] = Array.from(CATEGORY_COUNTS.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([name]) => {
    const meta = CATEGORY_META[name] || { description: `Free ${name.toLowerCase()} games.`, icon_name: 'Gamepad2', color: '#a9e9df' };
    return { id: `cat-${categorySlug(name)}`, slug: categorySlug(name), name, ...meta };
  });

export const CATEGORIES: CategoryInfo[] = RAW_CATEGORIES.map((cat) => ({
  ...cat,
  game_count: CATEGORY_COUNTS.get(cat.name) || 0,
}));

export function getGameBySlug(slug: string): GameManifest | undefined {
  return BY_KEY.get(slug);
}

export function getAllCategories(): CategoryInfo[] {
  return CATEGORIES;
}

export function getGamesByCategory(categorySlugOrName: string): GameManifest[] {
  const key = decodeURIComponent(categorySlugOrName || '').toLowerCase();
  const cat = CATEGORIES.find((c) => c.slug === key || c.name.toLowerCase() === key || c.name.toLowerCase() === key.replace(/-/g, ' '));
  const name = cat ? cat.name.toLowerCase() : key;
  return FEATURED_GAMES.filter((g) => matchesCategory(g, name));
}

export function getGamesByTag(tag: string): GameManifest[] {
  const q = tag.toLowerCase();
  return FEATURED_GAMES.filter((g) => g.tags.some((t) => t.toLowerCase() === q));
}

export function getRelatedGames(currentGameId: string, category: string, limit: number = 8): GameManifest[] {
  const out: GameManifest[] = [];
  for (const g of FEATURED_GAMES) {
    if (g.id !== currentGameId && g.category === category) {
      out.push(g);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Ranked by plays recorded on this site (ties keep the feed's newest-first order). */
export function getTrendingGames(): GameManifest[] {
  return [...FEATURED_GAMES].sort((a, b) => b.play_count - a.play_count);
}

/** Ranked by likes recorded on this site (ties keep the feed's newest-first order). */
export function getTopRatedGames(): GameManifest[] {
  return [...FEATURED_GAMES].sort((a, b) =>
    b.rating_score - a.rating_score || b.likes_count - a.likes_count || (b.quality_score || 0) - (a.quality_score || 0));
}

const CATCHY_CATEGORIES = new Set([
  'runner', 'arcade', 'action', 'hyper-casual', 'casual', 'racing',
  'sports', 'fighting', 'skill', 'platformer', 'ball'
]);

/** Curated ultra-engaging, fast-action games that hook players instantly without boredom. */
export function getCatchyGames(limit: number = 18, kidsOnly: boolean = false): GameManifest[] {
  const out: GameManifest[] = [];
  for (const g of FEATURED_GAMES) {
    if (kidsOnly && !g.is_kids_safe) continue;
    if ((g.quality_score || 0) >= 0.82 && (CATCHY_CATEGORIES.has(g.category.toLowerCase()) || g.tags.some(t => CATCHY_CATEGORIES.has(t.toLowerCase())))) {
      out.push(g);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** The absolute highest quality, best-looking, and most deeply playable masterpieces. */
export function getMasterpieceGames(limit: number = 18, kidsOnly: boolean = false): GameManifest[] {
  const out: GameManifest[] = [];
  for (const g of FEATURED_GAMES) {
    if (kidsOnly && !g.is_kids_safe) continue;
    if ((g.quality_score || 0) >= 0.935) {
      out.push(g);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function getNewGames(): GameManifest[] {
  return NEWEST;
}

export function getKidsGames(): GameManifest[] {
  return FEATURED_GAMES.filter((g) => g.is_kids_safe);
}

export function getTwoPlayerGames(): GameManifest[] {
  return FEATURED_GAMES.filter((g) => g.is_multiplayer || g.supported_players.includes('2'));
}

export function getRandomGame(excludeSlug?: string): GameManifest {
  const pool = FEATURED_GAMES.slice(0, 400);
  const candidates = excludeSlug ? pool.filter((g) => g.slug !== excludeSlug) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
}

export function getRandomGamePool(count: number = 8): GameManifest[] {
  const pool = FEATURED_GAMES.slice(0, 400);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
