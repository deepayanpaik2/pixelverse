#!/usr/bin/env node
/**
 * GamePix feed -> src/lib/games/registry.json
 *
 * Usage:
 *   npm run sync:feed                    # every game in the feed (~14,000), best quality first
 *   npm run sync:feed -- --limit 3000    # only the best 3000 (smaller site)
 *   npm run sync:feed -- --force         # re-download even if the games are fresh
 *   npm run sync:feed -- --file feed.json  # build from a feed page you already downloaded
 *
 * Needs GAMEPIX_SID (your property id, e.g. 771E7) in .env.local or the environment.
 *
 * Row layout (compact, expanded into full objects by src/lib/games/index.ts):
 *   [id, namespace, title, category, orientation, width, height, quality, published, description]
 */
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../../src/lib/games/registry.json');
const FEED_BASE = 'https://feeds.gamepix.com/v2/json';

function loadEnvFile() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* no .env.local — fine */ }
}

function cleanText(raw, max) {
  let t = String(raw == null ? '' : raw)
    .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (max && t.length > max) {
    const cut = t.slice(0, max);
    const sp = cut.lastIndexOf(' ');
    t = (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–—]+$/, '') + '…';
  }
  return t;
}

function slugify(title) {
  return String(title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function isoDay(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function buildRegistry(items) {
  if (!Array.isArray(items)) throw new Error('Expected an array of feed items');
  const rows = [];
  const seen = new Set();
  let skipped = 0;
  for (const g of items) {
    const id = String((g && g.id) || '').trim();
    const ns = String((g && g.namespace) || '').trim().toLowerCase();
    const title = cleanText(g && g.title, 120);
    if (!id || !/^[a-z0-9][a-z0-9-_]*$/.test(ns) || !title || seen.has(ns)) { skipped++; continue; }
    seen.add(ns);
    const w = parseInt(g.width, 10); const h = parseInt(g.height, 10);
    const q = Number(g.quality_score);
    rows.push([
      id, ns, title,
      cleanText(g.category, 40).toLowerCase() || 'casual',
      ['portrait', 'landscape', 'all'].includes(g.orientation) ? g.orientation : 'all',
      Number.isFinite(w) && w > 0 ? w : 800,
      Number.isFinite(h) && h > 0 ? h : 600,
      Number.isFinite(q) ? Math.round(q * 10000) / 10000 : 0,
      isoDay(g.date_published || g.date_modified),
      cleanText(g.description, 150),
    ]);
  }
  return { rows, skipped };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(sid, page, size) {
  const url = `${FEED_BASE}/?sid=${encodeURIComponent(sid)}&order=quality&pagination=${size}&page=${page}`;
  let lastErr;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      lastErr = new Error(`HTTP ${res.status}`);
      if (res.status < 500 && res.status !== 429) throw lastErr;   // a real 4xx will not fix itself
    } catch (e) { lastErr = e; if (/^HTTP 4/.test(e.message) && !/429/.test(e.message)) throw e; }
    await sleep(700 * attempt);                                     // rate limit / network blip: wait, then retry
  }
  throw lastErr;
}

/** Walks the feed page by page. If it stops early it returns what it already has, and says so. */
async function download(sid, limit) {
  const sizes = [96, 48, 24, 12];
  let size = sizes[0];
  const items = [];
  for (let page = 1; items.length < limit; page++) {
    let data;
    try { data = await getPage(sid, page, size); }
    catch (e) {
      const next = sizes[sizes.indexOf(size) + 1];
      if (page === 1 && next) { size = next; page--; continue; }
      if (items.length === 0) throw e;
      process.stdout.write('\n');
      console.warn(`!! Stopped early at page ${page} (${e.message}) with ${items.length} games. Run "npm run sync:feed" again to get the rest.`);
      break;
    }
    const batch = Array.isArray(data.items) ? data.items : [];
    items.push(...batch);
    process.stdout.write(`\rDownloaded ${items.length} games…`);
    if (batch.length === 0 || !data.next_url) break;
    await sleep(120);
  }
  process.stdout.write('\n');
  return items.slice(0, limit);
}

function readFeedFile(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (Array.isArray(j)) return j.flatMap((p) => (p && p.items) || p);
  return j.items || [];
}

async function main() {
  loadEnvFile();
  const args = process.argv.slice(2);
  const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (args.includes('--soft') && !args.includes('--force') && !arg('--file')) {
    try {
      const age = Date.now() - fs.statSync(OUT_FILE).mtimeMs;
      const count = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8')).length;
      if (count >= 200 && age < 12 * 3600 * 1000) { console.log(`GamePix games are up to date (${count.toLocaleString()} games).`); return; }
    } catch { /* no registry yet — sync */ }
  }
  let items;
  if (arg('--file')) items = readFeedFile(arg('--file'));
  else {
    const sid = process.env.GAMEPIX_SID || '771E7';
    const limit = arg('--limit') ? parseInt(arg('--limit'), 10) : Infinity;
    items = await download(sid, limit);
  }
  const { rows, skipped } = buildRegistry(items);
  if (rows.length === 0) throw new Error('No games parsed — refusing to overwrite the registry.');
  fs.writeFileSync(OUT_FILE, JSON.stringify(rows));
  const byCat = {};
  rows.forEach((r) => { byCat[r[3]] = (byCat[r[3]] || 0) + 1; });
  const mb = (fs.statSync(OUT_FILE).size / 1048576).toFixed(2);
  console.log(`Wrote ${rows.length} games (${skipped} skipped) to src/lib/games/registry.json (${mb} MB)`);
  console.log('Categories:', byCat);
}

module.exports = { cleanText, slugify, buildRegistry, download };
if (require.main === module) {
  // --soft (used before every build): if GamePix can't be reached, keep the current games and carry on
  const soft = process.argv.includes('--soft');
  main().catch((e) => {
    if (soft) { console.warn(`GamePix sync skipped (${e.message}). Keeping the existing games.`); process.exit(0); }
    console.error(e.message); process.exit(1);
  });
}
