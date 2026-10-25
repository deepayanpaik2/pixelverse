import type { GameManifest } from '@/types';

/** true when the game files live on THIS website (nothing in the catalog is hosted on-site any more) */
export function isOnSiteGame(game: Pick<GameManifest, 'source_type' | 'launch_path'>): boolean {
  return game.launch_path.startsWith('/');
}

/** The URL that goes into the iframe. GamePix embed URLs (play.gamepix.com/<game>/embed?sid=...) are used exactly as built from the feed. */
export function getLaunchUrl(game: GameManifest, _origin?: string): string {
  return game.embed_url || game.launch_path;
}

export function isLocalhostOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);
}
