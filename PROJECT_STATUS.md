# Pixelverse: Project Status

## Catalog
- 5,001 games from the GameMonetize HTML5 feed across 18 categories, newest first.
- Source of truth: `src/lib/games/registry.json` (compact rows) expanded by `src/lib/games/index.ts`.
- Refresh: `npm run sync:feed` (downloads the feed, cleans text, and updates the registry).
- Games embed from `https://html5.gamemonetize.co/{id}/` in a sandboxed iframe; thumbnails load from `img.gamemonetize.com`.

## Layout and Navigation
- Theme surfaces (`.glass-panel`, `.glass-chip`), ambient background gradients, spotlight hero, and tile interaction states.
- Infinite scroll grids (`GameGrid`) on home, arcade, categories, tags, new, trending, and favorites pages.
- Home page includes spotlight showcase, new releases, category shelves, and full catalog browsing.

## Verification
- `npm test`: 14 automated tests covering feed parsing, registry integrity, and social logic.
- `npx tsc --noEmit`: Typecheck passing with zero errors.

## Local and Demo Mode
- Authentication, rooms, chat, ratings, and favorites run on the built-in local store (`localStorage`) when Supabase credentials are not configured.
