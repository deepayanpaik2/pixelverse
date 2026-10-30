const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const pokiRegistryPath = path.join(__dirname, '../src/lib/games/poki-registry.json');
const pokiGames = JSON.parse(fs.readFileSync(pokiRegistryPath, 'utf-8'));

test('Poki Catalog Discovery & Structure', () => {
  assert.ok(Array.isArray(pokiGames), 'poki-registry.json must be an array');
  assert.strictEqual(pokiGames.length, 1504, 'Must contain all 1,504 discovered Poki games');

  const ids = new Set();
  const slugs = new Set();

  for (const tuple of pokiGames) {
    const [id, slug, poki_slug, title, category, author, play_mode, embed_url, rating, votes] = tuple;
    
    // Non-empty fields
    assert.ok(id && id.startsWith('poki-'), `ID must start with poki-: ${id}`);
    assert.ok(slug, `Slug required for ${id}`);
    assert.ok(poki_slug, `poki_slug required for ${id}`);
    assert.ok(title, `Title required for ${id}`);
    assert.ok(category, `Category required for ${id}`);
    assert.ok(author, `Author required for ${id}`);
    assert.ok(['embed', 'external'].includes(play_mode), `play_mode must be embed or external: ${play_mode}`);
    assert.ok(typeof rating === 'number' && rating >= 1 && rating <= 5, `Rating must be 1-5: ${rating}`);
    assert.ok(typeof votes === 'number' && votes > 0, `Votes must be positive: ${votes}`);

    // Uniqueness
    assert.strictEqual(ids.has(id), false, `Duplicate ID: ${id}`);
    assert.strictEqual(slugs.has(slug), false, `Duplicate slug: ${slug}`);
    ids.add(id);
    slugs.add(slug);
  }
});

test('Authorized Embed vs External Play Distinction', () => {
  let embedCount = 0;
  let externalCount = 0;

  for (const tuple of pokiGames) {
    const [, , poki_slug, , , , play_mode, embed_url] = tuple;
    if (play_mode === 'embed') {
      embedCount++;
      assert.ok(embed_url && (embed_url.includes('gamepix.com') || embed_url.includes('gamedistribution.com')), `Embed URL must be an authorized syndication network: ${embed_url}`);
    } else {
      externalCount++;
      assert.strictEqual(embed_url, '', 'External games must not have embed URLs to avoid CSP violations');
    }
  }

  assert.ok(embedCount >= 50, `At least 50 games should be authorized for in-browser embeds (got ${embedCount})`);
  assert.ok(externalCount >= 1400, `Remaining games must be mapped to authorized external launch (got ${externalCount})`);
});
