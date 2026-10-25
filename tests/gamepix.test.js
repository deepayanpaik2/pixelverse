const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { buildRegistry, slugify } = require('../scripts/sync-games/gamepix-feed.js');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '../scripts/sync-games/seed-feed.json'), 'utf-8')).items;

test('every seed game becomes a registry row with a unique namespace', () => {
  const { rows, skipped } = buildRegistry(seed);
  assert.strictEqual(skipped, 0);
  assert.strictEqual(rows.length, seed.length);
  assert.strictEqual(new Set(rows.map((r) => r[1])).size, rows.length);
});

test('rows keep the documented layout', () => {
  const [row] = buildRegistry(seed).rows;
  assert.strictEqual(row.length, 10);
  assert.strictEqual(typeof row[5], 'number');
  assert.match(row[8], /^\d{4}-\d{2}-\d{2}$/);
});

test('bad items are skipped, not crashed on', () => {
  const { rows, skipped } = buildRegistry([{ id: '1', title: 'X', namespace: 'Bad Name!' }, { id: '2' }, ...seed.slice(0, 1)]);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(skipped, 2);
});

test('shipped registry.json has no GameMonetize/GameDistribution leftovers', () => {
  const raw = fs.readFileSync(path.join(__dirname, '../src/lib/games/registry.json'), 'utf-8');
  assert.doesNotMatch(raw, /gamemonetize|gamedistribution/i);
});

test('slugify', () => assert.strictEqual(slugify('Prism Match 3D'), 'prism-match-3d'));
