const argon2 = require('argon2');
const crypto = require('crypto');

// Fixed salt used by the legacy SHA-256 implementation
const LEGACY_SALT = 'area-membros-salt';

/**
 * Hash a plain‑text password using Argon2id.
 * @param {string} password Plain password
 * @returns {Promise<string>} Argon2id hash
 */
async function hashPassword(password) {
  // Argon2id provides memory‑hard hashing – recommended for production.
  return await argon2.hash(password, { type: argon2.argon2id });
}

/**
 * Verify a password against a stored hash.
 * Supports both the new Argon2id format and the legacy SHA‑256 + fixed salt.
 * @param {string} hash Stored password hash (Argon2id or legacy hex)
 * @param {string} password Plain password to verify
 * @returns {Promise<boolean>} true if the password matches
 */
async function verifyPassword(hash, password) {
  if (isLegacyHash(hash)) {
    const legacyHash = crypto
      .createHash('sha256')
      .update(password + LEGACY_SALT)
      .digest('hex');
    return legacyHash === hash;
  }
  // Argon2id verification (throws on failure, so we catch & return false)
  try {
    return await argon2.verify(hash, password);
  } catch (_) {
    return false;
  }
}

/**
 * Detect whether a stored hash is from the legacy implementation.
 * Legacy SHA‑256 hashes are 64‑character hexadecimal strings.
 * Argon2id hashes start with "$argon2".
 * @param {string} hash Stored hash
 * @returns {boolean}
 */
function isLegacyHash(hash) {
  return typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
  isLegacyHash,
  // Exporting LEGACY_SALT for potential migration scripts (optional)
  LEGACY_SALT,
};
