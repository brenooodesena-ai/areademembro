const { hashPassword, verifyPassword, isLegacyHash } = require('../passwordUtils');
const crypto = require('crypto');

describe('Password utilities', () => {
  test('isLegacyHash correctly identifies legacy SHA-256 hashes', () => {
    const legacyHash = crypto.createHash('sha256').update('test' + 'area-membros-salt').digest('hex');
    expect(isLegacyHash(legacyHash)).toBe(true);
    expect(isLegacyHash('not-a-hex-hash')).toBe(false);
    // Argon2 hash example (real hash will start with $argon2)
    const dummyArgon = '$argon2id$v=19$m=4096,t=3,p=1$abcd$efgh';
    expect(isLegacyHash(dummyArgon)).toBe(false);
  });

  test('verifyPassword works for legacy hash', async () => {
    const password = 'mySecret123!';
    const legacyHash = crypto.createHash('sha256').update(password + 'area-membros-salt').digest('hex');
    const result = await verifyPassword(legacyHash, password);
    expect(result).toBe(true);
    const bad = await verifyPassword(legacyHash, 'wrong');
    expect(bad).toBe(false);
  });

  test('hashPassword generates Argon2id hash and verifyPassword validates it', async () => {
    const password = 'anotherSecurePass!@#';
    const hash = await hashPassword(password);
    expect(hash.startsWith('$argon2')).toBe(true);
    const ok = await verifyPassword(hash, password);
    expect(ok).toBe(true);
    const bad = await verifyPassword(hash, 'wrongPass');
    expect(bad).toBe(false);
  });
});
