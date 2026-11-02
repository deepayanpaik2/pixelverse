const test = require('node:test');
const assert = require('node:assert');
const { AccessToken } = require('livekit-server-sdk');

test('LiveKit Token Generation & Room Grant Verification', async (t) => {
  const apiKey = 'test_api_key_12345';
  const apiSecret = 'test_api_secret_at_least_32_characters_long_for_hmac_safety';
  const roomName = 'ROOM_X7Y2Z9';
  const participantId = 'client_uuid_abc_123';
  const participantName = 'Deep (Host)';
  const metadata = JSON.stringify({ color: '#00f0ff', isHost: true });

  // Generate Token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    metadata,
    ttl: '4h',
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  const jwt = await at.toJwt();

  // Assertions
  assert.ok(typeof jwt === 'string', 'JWT should be a string');
  assert.ok(jwt.split('.').length === 3, 'JWT should contain 3 parts: header.payload.signature');
  assert.ok(jwt.length > 100, 'JWT should be of valid length');

  // Decode JWT payload without verifying signature (standard verification)
  const payloadBase64 = jwt.split('.')[1];
  const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
  const payload = JSON.parse(payloadJson);

  assert.strictEqual(payload.sub, participantId, 'Subject (identity) must match participant');
  assert.strictEqual(payload.name, participantName, 'Name must match participantName');
  assert.strictEqual(payload.metadata, metadata, 'Metadata must match serialized metadata');
  assert.ok(payload.video, 'Payload must contain video grant');
  assert.strictEqual(payload.video.room, roomName, 'Video grant room must match requested room');
  assert.strictEqual(payload.video.roomJoin, true, 'roomJoin must be true');
  assert.strictEqual(payload.video.canPublish, true, 'canPublish must be true');
  assert.strictEqual(payload.video.canPublishData, true, 'canPublishData must be true');
  assert.strictEqual(payload.video.canSubscribe, true, 'canSubscribe must be true');

  // Verify secret is NOT leaked into the JWT payload
  assert.strictEqual(payloadJson.includes(apiSecret), false, 'API secret must NEVER appear in the JWT payload');
});

test('LiveKit Token Security & Isolation between Rooms', async (t) => {
  const apiKey = 'test_api_key_12345';
  const apiSecret = 'test_api_secret_at_least_32_characters_long_for_hmac_safety';

  // Room A Token
  const tokenA = new AccessToken(apiKey, apiSecret, { identity: 'user_1' });
  tokenA.addGrant({ room: 'ROOM_ALPHA', roomJoin: true });
  const jwtA = await tokenA.toJwt();

  // Room B Token
  const tokenB = new AccessToken(apiKey, apiSecret, { identity: 'user_2' });
  tokenB.addGrant({ room: 'ROOM_BETA', roomJoin: true });
  const jwtB = await tokenB.toJwt();

  const payloadA = JSON.parse(Buffer.from(jwtA.split('.')[1], 'base64url').toString('utf8'));
  const payloadB = JSON.parse(Buffer.from(jwtB.split('.')[1], 'base64url').toString('utf8'));

  assert.strictEqual(payloadA.video.room, 'ROOM_ALPHA');
  assert.strictEqual(payloadB.video.room, 'ROOM_BETA');
  assert.notStrictEqual(payloadA.video.room, payloadB.video.room, 'Participants in different rooms must not share room grants');
});

test('LiveKit Room Code Sanitization & Validation', (t) => {
  function sanitizeRoom(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const clean = raw.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 64);
    return clean.length >= 3 ? clean : null;
  }

  assert.strictEqual(sanitizeRoom('ABCDEF'), 'ABCDEF');
  assert.strictEqual(sanitizeRoom(' room-123_test.xyz '), 'room-123_test.xyz');
  assert.strictEqual(sanitizeRoom('abc<script>alert(1)</script>'), 'abcscriptalert1script');
  assert.strictEqual(sanitizeRoom(''), null);
  assert.strictEqual(sanitizeRoom('a'), null, 'Rooms shorter than 3 chars should be rejected');
  assert.strictEqual(sanitizeRoom(null), null);
  assert.strictEqual(sanitizeRoom(undefined), null);
});
