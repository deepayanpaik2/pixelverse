# Pixelverse - Web Games Portal

> Browser-game portal combining HTML5 games, WebRTC rooms, user profiles, and messaging.

---

## Features

### 1. Game Arcade
- **Thumbnail Grid**: Mosaic arrangement (`1x1`, `2x2`, `wide`) with category filters and search.
- **Game Player (`/game/[slug]`)**:
  - Sandboxed HTML5 embeds.
  - Fullscreen, audio mute, and aspect ratio controls.
  - Ratings and favorites.
  - Party rooms support.

### 2. Catalog
- Catalog feed integration via `scripts/sync-games/gamepix-feed.js`.
- Run `npm run sync:feed` to refresh `src/lib/games/registry.json`.

### 3. Social Features
- **WebRTC Voice Rooms (`/rooms/[id]`)**: Device selection, mute controls, and shared room games.
- **Messaging (`/messages`)**: Direct and group conversations.
- **Communities (`/community`)**: Text and voice channels.
- **User Profiles (`/u/[username]`)**: Avatars, levels, and favorites.
- **Friends (`/friends`)**: Requests, presence, and blocking.
- **Moderation (`/admin`)**: Submissions and catalog management.

---

## Publisher Notes

1. Keep your publisher account in good standing and ensure your live domain is registered.
2. Embed games using feed URLs without stripping or blocking ad parameters.

---

## Quick Start

### 1. Install and Sync
```bash
npm install
npm test
```

### 2. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Production Build
```bash
npm run build
npm start
```

---

## Database Architecture

- `supabase/migrations/00001_initial_schema.sql`: Profiles, preferences, friendships, conversations, messages, rooms, and moderation.
- `supabase/migrations/00002_playverse_schema.sql`: Categories, tags, ratings, plays, developer submissions, and DMCA notices.
- `supabase/migrations/00003_gamedistribution_schema.sql`: Game metadata schema.
