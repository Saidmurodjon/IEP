import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { isValidKey, type MediaBucket, type MediaObject } from './storage';

/**
 * Diskdagi media ombori — Node (webname hosting) uchun R2 o'rnini bosadi.
 *
 * Fayl `<root>/<key>` da, Content-Type esa yonidagi `<key>.meta.json` da
 * saqlanadi. Kalit doim `isValidKey()` dan o'tadi, yakuniy yo'l esa `root`
 * ichida ekani qayta tekshiriladi — `../` orqali ombordan chiqib bo'lmaydi.
 * Ombor papkasi `public_html` dan TASHQARIDA bo'lishi kerak: fayllar faqat
 * `GET /api/files/:key` orqali, `nosniff` sarlavhasi bilan beriladi.
 */
export class FsStorageKeyError extends Error {
  constructor() {
    super('Invalid storage key');
    this.name = 'FsStorageKeyError';
  }
}

interface Meta {
  contentType?: string;
}

export function createFsStorage(rootDir: string): MediaBucket {
  const root = resolve(rootDir);

  function pathFor(key: string): string {
    if (!isValidKey(key)) throw new FsStorageKeyError();
    const full = resolve(root, key);
    if (!full.startsWith(root + sep)) throw new FsStorageKeyError();
    return full;
  }

  return {
    async put(key, value, options) {
      const file = pathFor(key);
      await mkdir(dirname(file), { recursive: true });
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      const meta: Meta = { contentType: options?.httpMetadata?.contentType };
      // Avval meta, keyin fayl: fayl mavjud bo'lsa, meta ham albatta bor.
      await writeFile(`${file}.meta.json`, JSON.stringify(meta), { mode: 0o640 });
      await writeFile(file, bytes, { mode: 0o640 });
    },

    async get(key): Promise<MediaObject | null> {
      let file: string;
      try {
        file = pathFor(key);
      } catch {
        return null;
      }
      let info;
      try {
        info = await stat(file);
      } catch {
        return null;
      }
      if (!info.isFile()) return null;

      let meta: Meta = {};
      try {
        meta = JSON.parse(await readFile(`${file}.meta.json`, 'utf8')) as Meta;
      } catch {
        // Meta yo'q — `files` route `application/octet-stream` beradi.
      }

      return {
        body: Readable.toWeb(createReadStream(file)) as ReadableStream,
        // Kalit o'zgarmas, shuning uchun hajm + vaqt yetarli ETag.
        httpEtag: `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`,
        httpMetadata: { contentType: meta.contentType },
      };
    },

    async delete(key) {
      const file = pathFor(key);
      await rm(file, { force: true });
      await rm(`${file}.meta.json`, { force: true });
    },
  };
}
