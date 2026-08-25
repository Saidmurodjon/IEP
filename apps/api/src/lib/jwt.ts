// Web Crypto API asosidagi JWT (HS256) — Cloudflare Workers va Node.js'da ishlaydi.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** JSON'ni UTF-8 xavfsiz base64url ga o'giradi (`btoa` o'zi lotin bo'lmagan belgilarda xato beradi). */
function encodeJson(value: unknown): string {
  return base64urlEncode(encoder.encode(JSON.stringify(value)));
}

function decodeJson(segment: string): unknown {
  return JSON.parse(decoder.decode(base64urlDecode(segment)));
}

async function getKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  );
}

export async function signToken(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = { ...payload, iat: now, exp: now + 7 * 24 * 3600 };

  const message = `${encodeJson(header)}.${encodeJson(fullPayload)}`;
  const key = await getKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));

  return `${message}.${base64urlEncode(new Uint8Array(signature))}`;
}

/**
 * Token'ni tekshiradi va payload'ni qaytaradi.
 * Token yaroqsiz, imzosi noto'g'ri yoki muddati o'tgan bo'lsa — `throw` qiladi.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<Record<string, unknown>> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error('Invalid token format');

  // `alg` ni tekshirish — "alg confusion" (masalan `none`) hujumining oldini oladi.
  const header = decodeJson(headerB64);
  if (
    typeof header !== 'object' ||
    header === null ||
    (header as { alg?: unknown }).alg !== 'HS256'
  ) {
    throw new Error('Unsupported token algorithm');
  }

  const key = await getKey(secret, ['verify']);
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlDecode(sigB64);

  const valid = await crypto.subtle.verify('HMAC', key, signature as BufferSource, data);
  if (!valid) throw new Error('Invalid signature');

  const payload = decodeJson(payloadB64);
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid token payload');
  }

  const exp = (payload as { exp?: unknown }).exp;
  if (typeof exp === 'number' && exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }

  return payload as Record<string, unknown>;
}
