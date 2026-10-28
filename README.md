# Pixelverse

Pixelverse is a web portal for browser games. It includes an HTML5 game catalog, WebRTC voice and video rooms, user profiles, and direct messaging.

## Requirements

- Node.js 18.17 or later
- npm 9 or later

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   ```bash
   cp .env.example .env.local
   ```
   If environment variables are not configured, the app runs in demo mode using local storage.

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application runs on [http://localhost:3000](http://localhost:3000).

## Testing and Type Checking

Run the test suite:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

## Catalog Feed Synchronization

The catalog registry can be refreshed from the remote feed:
```bash
npm run sync:feed
```
This updates `src/lib/games/registry.json`.

## Project Structure

- `src/app/`: Next.js App Router pages and API routes.
- `src/components/`: Reusable interface components and layout elements.
- `src/features/`: Feature-level logic and context providers (e.g. auth).
- `src/lib/`: Core libraries for games catalog, WebRTC rooms, synthesized audio, and mock data.
- `supabase/`: Database migrations and local seed SQL.
- `tests/`: Automated unit tests using Node.js built-in test runner.

## Production Build

```bash
npm run build
npm start
```
