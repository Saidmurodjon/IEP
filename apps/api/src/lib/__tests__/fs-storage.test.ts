import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFsStorage, FsStorageKeyError } from '../fs-storage';

const KEY = '2026/09/0b0e6f4a-1c2d-4e5f-8a9b-0c1d2e3f4a5b.png';

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'iep-fs-storage-'));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('createFsStorage', () => {
  it('put → get → delete aylanishi', async () => {
    const store = createFsStorage(dir);
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
    await store.put(KEY, bytes, { httpMetadata: { contentType: 'image/png' } });

    const obj = await store.get(KEY);
    expect(obj).not.toBeNull();
    expect(obj?.httpMetadata?.contentType).toBe('image/png');
    expect(obj?.httpEtag).toMatch(/^"[0-9a-f]+-[0-9a-f]+"$/);
    const back = new Uint8Array(await new Response(obj?.body).arrayBuffer());
    expect([...back]).toEqual([...bytes]);

    await store.delete(KEY);
    expect(await store.get(KEY)).toBeNull();
    expect(await readdir(join(dir, '2026/09'))).toEqual([]);
  });

  it('mavjud bo\'lmagan kalit uchun null', async () => {
    expect(await createFsStorage(dir).get(KEY)).toBeNull();
  });

  it.each([
    '../../etc/passwd',
    '2026/09/../../../etc/passwd',
    '/etc/passwd',
    `${KEY}.meta.json`,
    '2026/09/x.png',
  ])('noto\'g\'ri kalit rad etiladi: %s', async (key) => {
    const store = createFsStorage(dir);
    await expect(store.put(key, new Uint8Array([1]))).rejects.toBeInstanceOf(FsStorageKeyError);
    await expect(store.delete(key)).rejects.toBeInstanceOf(FsStorageKeyError);
    expect(await store.get(key)).toBeNull();
  });
});
