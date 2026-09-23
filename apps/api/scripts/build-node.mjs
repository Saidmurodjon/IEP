// webname (cPanel Node.js App) uchun deploy paketini yig'adi.
//
// Natija: apps/api/deploy/iep-api/ va apps/api/deploy/iep-api.zip
//   server.cjs         — butun API bitta faylda (@prisma/client tashqarida)
//   package.json       — serverda `npm install`, keyin ilova papkasida `npm run generate`
//   prisma/            — schema.prisma va migrations/ (`npx prisma migrate deploy`)
//
// Secret'lar paketga TUSHMAYDI — ular cPanel formasida kiritiladi.
import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = resolve(apiDir, '../..');
const outDir = join(apiDir, 'deploy/iep-api');
const require = createRequire(join(apiDir, 'package.json'));

const prismaVersion = JSON.parse(
  await readFile(require.resolve('@prisma/client/package.json'), 'utf8')
).version;

await rm(join(apiDir, 'deploy'), { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [join(apiDir, 'src/node.ts')],
  outfile: join(outDir, 'server.cjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  tsconfig: join(apiDir, 'tsconfig.json'),
  external: ['@prisma/client', '.prisma/client'],
  legalComments: 'none',
  logLevel: 'warning',
});

await cp(join(rootDir, 'packages/db/prisma/schema.prisma'), join(outDir, 'prisma/schema.prisma'));
await cp(join(rootDir, 'packages/db/prisma/migrations'), join(outDir, 'prisma/migrations'), {
  recursive: true,
});

const pkg = {
  name: 'iep-api',
  version: '1.0.0',
  private: true,
  type: 'commonjs',
  main: 'server.cjs',
  engines: { node: '>=22' },
  scripts: {
    start: 'node server.cjs',
    // postinstall EMAS: CloudLinux `npm install` ni ~/nodevenv/.../lib ichida
    // ishga tushiradi, u yerda prisma/ papkasi yo'q. Ilova papkasida qo'lda.
    generate: 'prisma generate --schema=prisma/schema.prisma',
    migrate: 'prisma migrate deploy --schema=prisma/schema.prisma',
  },
  dependencies: {
    '@prisma/client': prismaVersion,
    prisma: prismaVersion,
  },
};
await writeFile(join(outDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

execFileSync('zip', ['-rq', '../iep-api.zip', '.'], { cwd: outDir });
console.log(`OK: ${join(apiDir, 'deploy/iep-api.zip')} (prisma ${prismaVersion})`);
