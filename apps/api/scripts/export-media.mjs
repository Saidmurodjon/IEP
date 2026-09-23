// Lokal wrangler R2 holatidagi media fayllarni diskdagi ombor shakliga eksport qiladi.
//
// Natija: apps/api/deploy/iep-media/<key> + <key>.meta.json (lib/fs-storage.ts formati)
//         va apps/api/deploy/iep-media.tar.gz — serverda MEDIA_DIR ichiga ochiladi.
//
// Manba: .wrangler/state/v3/r2 (miniflare). Kalit `isValidKey()` dan o'tmasa yoki
// blob hajmi yozuvdagi bilan mos kelmasa, skript to'xtaydi (fail closed).
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r2Dir = join(apiDir, '.wrangler/state/v3/r2');
const bucket = process.argv[2] ?? 'energetika-media';
const outDir = join(apiDir, 'deploy/iep-media');

// lib/storage.ts dagi isValidKey bilan bir xil: YYYY/MM/<uuid>.<ext>
const KEY_RE = /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

const objectsDir = join(r2Dir, 'miniflare-R2BucketObject');
const dbFile = (await readdir(objectsDir)).find(
  (f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite'
);
if (!dbFile) throw new Error(`R2 bazasi topilmadi: ${objectsDir}`);

const db = new DatabaseSync(join(objectsDir, dbFile), { readOnly: true });
const rows = db
  .prepare('SELECT key, blob_id, size, http_metadata FROM _mf_objects ORDER BY key')
  .all();
db.close();

await rm(outDir, { recursive: true, force: true });

let total = 0;
for (const row of rows) {
  const key = String(row.key);
  if (!KEY_RE.test(key)) throw new Error(`Noto'g'ri kalit: ${key}`);
  const bytes = await readFile(join(r2Dir, bucket, 'blobs', String(row.blob_id)));
  if (bytes.length !== Number(row.size)) {
    throw new Error(`Hajm mos emas: ${key} (${bytes.length} != ${row.size})`);
  }
  const { contentType } = JSON.parse(String(row.http_metadata));
  const file = join(outDir, key);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.meta.json`, JSON.stringify({ contentType }));
  await writeFile(file, bytes);
  total += bytes.length;
}

// COPYFILE_DISABLE: macOS tar arxivga `._*` (AppleDouble) fayllarini qo'shmasin.
execFileSync('tar', ['-czf', '../iep-media.tar.gz', '.'], {
  cwd: outDir,
  env: { ...process.env, COPYFILE_DISABLE: '1' },
});
console.log(`${rows.length} ta fayl, ${total} bayt → deploy/iep-media.tar.gz`);
