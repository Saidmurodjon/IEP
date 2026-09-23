import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import { getStorage, buildKey, StorageUnavailableError, type MediaBucket } from '../lib/storage';
import {
  detectType, documentExtension, FORMAT_LABELS, LIMITS, type UploadKind,
} from '../lib/file-types';
import { logEvent } from '../lib/error-log';
import type { AppContext } from '../index';

export const uploadsRouter = new Hono<AppContext>();

const KINDS: UploadKind[] = ['image', 'photo', 'document'];

/** Egasiz fayl shu muddatdan keyin tozalanadi. */
const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

uploadsRouter.post('/', requireAuth, async (c) => {
  let bucket: MediaBucket;
  try {
    bucket = getStorage(c.env);
  } catch (err) {
    if (err instanceof StorageUnavailableError) {
      console.error('Upload rejected: R2 binding MEDIA is missing');
      logEvent(c, {
        source: 'server', level: 'error', code: 'STORAGE_UNAVAILABLE',
        message: 'R2 binding MEDIA is not configured',
        path: new URL(c.req.url).pathname, method: c.req.method, statusCode: 503,
      });
      return fail(c, 'STORAGE_UNAVAILABLE', 'Media storage is not configured');
    }
    throw err;
  }

  const kindRaw = c.req.query('kind') ?? 'image';

  // 1-tekshiruv: hajm oqim o'qilishidan OLDIN, `Content-Length` bo'yicha.
  // Bu katta faylni umuman xotiraga olmaslik uchun.
  const kind = (KINDS as string[]).includes(kindRaw) ? (kindRaw as UploadKind) : null;
  if (!kind) return fail(c, 'VALIDATION_ERROR', 'Unknown upload kind');
  const limit = LIMITS[kind];

  const declaredLength = Number(c.req.header('Content-Length') ?? '0');
  if (declaredLength > limit.maxBytes + 64 * 1024) {
    return fail(c, 'FILE_TOO_LARGE', 'Declared content length exceeds the limit', {
      limit: limit.label,
    });
  }

  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    return fail(c, 'VALIDATION_ERROR', 'Malformed multipart body');
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return fail(c, 'VALIDATION_ERROR', 'Field "file" is missing');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes.byteLength === 0) return fail(c, 'EMPTY_FILE', 'Uploaded file is empty');

  // 2-tekshiruv: haqiqiy o'qilgan hajm. `Content-Length` yolg'on bo'lishi mumkin.
  if (bytes.byteLength > limit.maxBytes) {
    return fail(c, 'FILE_TOO_LARGE', 'File exceeds the size limit', { limit: limit.label });
  }

  // Tur FAQAT magic bayt bo'yicha. `file.type` va kengaytma hisobga olinmaydi.
  const detected = detectType(bytes);
  if (!detected || !limit.mimes.includes(detected.mime)) {
    return fail(c, 'UNSUPPORTED_TYPE', 'File signature is not allowed for this kind', {
      formats: FORMAT_LABELS[kind],
    });
  }
  if (kind !== 'document' && !detected.isImage) {
    return fail(c, 'UNSUPPORTED_TYPE', 'Expected an image', { formats: FORMAT_LABELS[kind] });
  }

  const originalName = (file.name || 'file').slice(0, 200);
  const extension =
    kind === 'document' ? documentExtension(detected, originalName) : detected.extension;
  const key = buildKey(extension);

  try {
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: detected.mime,
        // Kalit takrorlanmaydi, shuning uchun uzoq muddatli kesh xavfsiz.
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('R2 put failed:', err instanceof Error ? err.message : err);
    logEvent(c, {
      source: 'server', level: 'error', code: 'UPLOAD_FAILED',
      message: `R2 put failed: ${err instanceof Error ? err.message : 'unknown'}`,
      path: new URL(c.req.url).pathname, method: c.req.method, statusCode: 500,
    });
    return fail(c, 'UPLOAD_FAILED', 'Storage write failed');
  }

  const width = Number(form.get('width') ?? '') || null;
  const height = Number(form.get('height') ?? '') || null;
  const ownerType = typeof form.get('ownerType') === 'string' ? String(form.get('ownerType')) : null;
  const ownerId = typeof form.get('ownerId') === 'string' && form.get('ownerId')
    ? String(form.get('ownerId'))
    : null;

  const db = c.get('db');
  const record = await db.mediaFile.create({
    data: {
      key,
      originalName,
      mimeType: detected.mime,
      size: bytes.byteLength,
      width,
      height,
      ownerType,
      ownerId,
    },
  });

  return c.json(
    {
      data: {
        id: record.id,
        key,
        url: `/api/files/${key}`,
        originalName,
        mimeType: detected.mime,
        size: bytes.byteLength,
      },
    },
    201
  );
});

/**
 * Egasiz fayllarni tozalash. Hozircha qo'lda ishga tushiriladi, cron keyinroq.
 *
 * O'chirish FAQAT `media_files` jadvalida qayd etilgan kalitlar bo'yicha —
 * ombor bo'ylab ommaviy o'chirish qilinmaydi (07-topshiriq, 7-bo'lim).
 */
uploadsRouter.post('/cleanup', requireAuth, async (c) => {
  let bucket: MediaBucket;
  try {
    bucket = getStorage(c.env);
  } catch {
    return fail(c, 'STORAGE_UNAVAILABLE', 'Media storage is not configured');
  }

  const db = c.get('db');
  const cutoff = new Date(Date.now() - ORPHAN_MAX_AGE_MS);
  const orphans = await db.mediaFile.findMany({
    where: { ownerId: null, createdAt: { lt: cutoff } },
    select: { id: true, key: true },
  });

  for (const orphan of orphans) {
    await bucket.delete(orphan.key);
  }
  if (orphans.length > 0) {
    await db.mediaFile.deleteMany({ where: { id: { in: orphans.map((o) => o.id) } } });
  }

  return c.json({ data: { deleted: orphans.length } });
});
