export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 310000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function setPassword(password) {
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  localStorage.setItem('meridian-auth', JSON.stringify({ hash, salt }));
}

export async function verifyPassword(password) {
  const stored = JSON.parse(localStorage.getItem('meridian-auth'));
  if (!stored) return false;
  const hash = await hashPassword(password, stored.salt);
  return hash === stored.hash;
}

export function hasStoredPassword() {
  return !!localStorage.getItem('meridian-auth');
}
