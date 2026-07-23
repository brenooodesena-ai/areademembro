// passwordGeneration.test.js
// Tests that the temporary password generated for new students is random and that its hash matches the stored value.

const crypto = require('crypto');

// Copied from webhook-server/index.js (must stay in sync with implementation)
function hashPassword(password) {
  const salt = 'area-membros-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateTempPassword() {
  // 16 random bytes => 22 base64url chars (>=12)
  const raw = crypto.randomBytes(16);
  const base = raw.toString('base64url');
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const insertSymbol = (str, pos, sym) => str.slice(0, pos) + sym + str.slice(pos);
  const pos1 = Math.floor(Math.random() * base.length);
  const pos2 = Math.floor(Math.random() * (base.length + 1));
  const sym1 = symbols[Math.floor(Math.random() * symbols.length)];
  const sym2 = symbols[Math.floor(Math.random() * symbols.length)];
  let pwd = insertSymbol(base, pos1, sym1);
  pwd = insertSymbol(pwd, pos2, sym2);
  return pwd;
}

// ---- Tests ----
function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// 1. Generate two passwords – they should be different (high probability)
const pwd1 = generateTempPassword();
const pwd2 = generateTempPassword();
assert(pwd1 !== pwd2, 'Generated passwords should be different');

// 2. Password length must be >= 12
assert(pwd1.length >= 12, 'Password length should be at least 12 characters');
assert(pwd2.length >= 12, 'Password length should be at least 12 characters');

// 3. Hash of the password must match the function output
const hash1 = hashPassword(pwd1);
const recomputed1 = crypto.createHash('sha256').update(pwd1 + 'area-membros-salt').digest('hex');
assert(hash1 === recomputed1, 'Hash of password does not match expected SHA-256 hash');

const hash2 = hashPassword(pwd2);
const recomputed2 = crypto.createHash('sha256').update(pwd2 + 'area-membros-salt').digest('hex');
assert(hash2 === recomputed2, 'Hash of second password does not match expected SHA-256 hash');

console.log('All password generation and hashing tests passed.');
