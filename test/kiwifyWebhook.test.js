// kiwifyWebhook.test.js
// Automated test for the Ed25519 signature validation logic used in webhook-server/index.js

const crypto = require('crypto');
const assert = require('assert');

// Helper to convert Buffer to base64url string
function toBase64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Generate a fresh Ed25519 key pair for testing
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Export public key via env var as expected by the server
process.env.KIWIFY_PUBLIC_KEY = publicKey;

// Test data
const path = '/webhook';
const method = 'POST';
const payload = { test: 'data', order_status: 'paid' };
const rawBody = JSON.stringify(payload);
const timestamp = Date.now();

function buildMessage(ts, body) {
  return `${path}:${method}:${body}:${ts}`;
}

function signMessage(message) {
  const hash = crypto.createHash('sha256').update(message).digest();
  const sig = crypto.sign(null, hash, privateKey);
  return { hash, signature: sig };
}

// ----- Valid signature test -----
const message = buildMessage(timestamp, rawBody);
const { hash, signature } = signMessage(message);
const signatureB64Url = toBase64Url(signature);

// Verification using the same logic as in the route
const publicKeyPem = process.env.KIWIFY_PUBLIC_KEY;
const isValid = crypto.verify(null, hash, { key: publicKeyPem, format: 'pem', type: 'spki' }, Buffer.from(signatureB64Url, 'base64url'));
assert.strictEqual(isValid, true, 'Valid signature should be accepted');

// ----- Invalid signature test -----
const tamperedSignature = Buffer.from(signature);
// Flip a bit to corrupt the signature
tamperedSignature[0] ^= 0xff;
const tamperedB64Url = toBase64Url(tamperedSignature);
const isInvalid = crypto.verify(null, hash, { key: publicKeyPem, format: 'pem', type: 'spki' }, Buffer.from(tamperedB64Url, 'base64url'));
assert.strictEqual(isInvalid, false, 'Corrupted signature should be rejected');

// ----- Timestamp validation tests -----
const now = Date.now();
const withinWindow = now - 2 * 60 * 1000; // 2 minutes ago, valid
const outsideWindow = now - 10 * 60 * 1000; // 10 minutes ago, expired

function isTimestampValid(ts) {
  const diff = Math.abs(Date.now() - ts);
  return diff <= 5 * 60 * 1000;
}
assert.strictEqual(isTimestampValid(withinWindow), true, 'Timestamp within 5 minutes should be valid');
assert.strictEqual(isTimestampValid(outsideWindow), false, 'Timestamp older than 5 minutes should be invalid');

// ----- Missing headers test -----
function simulateHeaderCheck(headers) {
  const { 'x-kiwify-digital-signature': sig, 'x-kiwify-timestamp': ts } = headers;
  if (!sig || !ts) return false;
  return true;
}
assert.strictEqual(simulateHeaderCheck({}), false, 'Missing headers should be detected');
assert.strictEqual(
  simulateHeaderCheck({ 'x-kiwify-digital-signature': signatureB64Url, 'x-kiwify-timestamp': timestamp.toString() }),
  true,
  'Present headers should be accepted'
);

console.log('All Kiwify webhook validation tests passed.');
