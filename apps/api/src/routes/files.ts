import { Hono } from 'hono';
import { fail } from '../lib/errors';
import { getStorage, isValidKey, StorageUnavailableError } from '../lib/storage';
import type { AppContext } from '../index';

export const filesRouter = new Hono<AppContext>();

/**
 * Fayllarni berish. Endpoint OCHIQ — rasmlar saytda ko'rinishi kerak.
 *
 * Kalit tasodifiy va takrorlanmaydi, shuning uchun uzoq muddatli kesh
 * xavfsiz: bir kalit doim bir xil faylni bildiradi.
 */
filesRouter.get('/*', async (c) => {
  // Hono `/*` naqshida qolgan qismni `param('*')` orqali beradi.
  const key = c.req.path.replace(/^\/api\/files\//, '');

  if (!isValidKey(key)) {
    return fail(c, 'NOT_FOUND', 'Invalid file key');
  }

  let bucket: R2Bucket;
  try {
    bucket = getStorage(c.env);
  } catch (err) {
    if (err instanceof StorageUnavailableError) {
      return fail(c, 'STORAGE_UNAVAILABLE', 'Media storage is not configured');
    }
    throw err;
  }

  const object = await bucket.get(key);
  if (!object) return fail(c, 'NOT_FOUND', 'File not found');

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);
  // Brauzer faylni sahifa sifatida talqin qilmasin.
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', 'inline');

  return new Response(object.body, { headers });
});
