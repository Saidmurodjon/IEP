/**
 * TEST MA'LUMOTLARI — FAQAT LOKAL BAZA UCHUN (14-topshiriq).
 *
 * `demo-content.ts` dan farqi: bu yerdagi ma'lumot ATAYLAB soxta ko'rinadi
 * («Xodim 07», «Lorem ipsum») — maqsad sayt HAMMA bo'limda TO'LA hajmda
 * qanday ishlashini ko'rish (sahifalash, kartochka to'ri, qidiruv indeksi,
 * uch til), haqiqiy kontent emas.
 *
 * Ishga tushirish:
 *   npm run db:test          — to'ldirish
 *   npm run db:test:clean    — `test-` prefiksli hammasini olib tashlash
 *
 * Ikki bosqich:
 *   A — fayllar `POST /api/uploads` orqali (API ishga tushirilgan bo'lishi
 *       shart: `npm run dev` yoki `npm run dev --workspace=apps/api`).
 *   B — qolgan yozuvlar to'g'ridan-to'g'ri Prisma bilan.
 */
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { reindexAllSql, SEARCH_TABLES } from '@energetika/shared';
import sharp from 'sharp';
import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Ikkalasi ham lokal bazani ko'rsatishi shart — Neon'ga bitta ham yozuv tushmasin. */
function assertLocalDatabase(url: string | undefined): asserts url is string {
  if (!url) throw new Error('DATABASE_URL o\'rnatilmagan.');
  const isLocal = /@(localhost|127\.0\.0\.1|iep-pg|iep-neon-proxy)[:/]/.test(url);
  if (!isLocal && process.env.ALLOW_REMOTE_TEST_CONTENT !== 'yes') {
    throw new Error(
      'Bu skript FAQAT lokal baza uchun. DATABASE_URL lokal emas.\n' +
        'Test ma\'lumoti production bazasiga yozilmasligi kerak (14-topshiriq, 1-qoida).'
    );
  }
}

assertLocalDatabase(process.env.DATABASE_URL);
const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Lokal Postgres Neon HTTP protokolini tushunmaydi — `local-neon-http-proxy`
 * shu ikkovi orasida tarjimon. Haqiqiy Neon bo'lsa (`neon.tech`), drayver
 * o'zi to'g'ri manzilni topadi va bu qatorlar hech narsani o'zgartirmaydi.
 */
if (!/neon\.tech/.test(DATABASE_URL)) {
  const { hostname, port } = new URL(DATABASE_URL.replace(/^postgres(ql)?:/, 'http:'));
  const proxyUrl = `http://${hostname}:${port || '4444'}/sql`;
  neonConfig.fetchEndpoint = () => proxyUrl;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const API_URL = process.env.TEST_CONTENT_API_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const db = (() => {
  const adapter = new PrismaNeonHTTP(DATABASE_URL, {});
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
})();

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.resolve(HERE, '../.test-media.json');

interface MediaCache {
  [key: string]: string; // mantiqiy nom -> "/api/files/<key>"
}

async function loadCache(): Promise<MediaCache> {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache: MediaCache): Promise<void> {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// --------------------------------------------------------------------------
// Bosqich A — fayllar
// --------------------------------------------------------------------------

let authToken: string | null = null;

async function login(): Promise<string> {
  if (authToken) return authToken;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'ADMIN_EMAIL / ADMIN_PASSWORD o\'rnatilmagan — .env dan o\'qiladi ' +
        '(bular lokal admin hisobiga mos bo\'lishi kerak, `npm run db:seed` bilan yaratilgan).'
    );
  }
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(
      `Login muvaffaqiyatsiz (${res.status}). API ishga tushirilganmi ` +
        `(${API_URL})? ADMIN_EMAIL/ADMIN_PASSWORD lokal admin bilan mosmi?`
    );
  }
  const json = (await res.json()) as { data: { token: string } };
  authToken = json.data.token;
  return authToken;
}

/** Bitta faylni yuklaydi va nisbiy manzilni qaytaradi (`/api/files/<key>`). */
async function uploadFile(
  bytes: Uint8Array,
  filename: string,
  kind: 'image' | 'photo' | 'document',
  contentType: string
): Promise<string> {
  const token = await login();
  const form = new FormData();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  form.append('file', new Blob([buffer], { type: contentType }), filename);

  const res = await fetch(`${API_URL}/api/uploads?kind=${kind}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yuklash muvaffaqiyatsiz (${filename}, ${res.status}): ${text}`);
  }
  const json = (await res.json()) as { data: { url: string } };
  return json.data.url;
}

/**
 * Fayl yuklangandan keyin uni yozuvga biriktiradi — 24 soatdan keyin "egasiz"
 * deb o'chirilmasin.
 *
 * `updateMany()` EMAS — `PrismaNeonHTTP` bilan `updateMany`/`createMany`
 * "Transactions are not supported in HTTP mode" bilan yiqiladi (bu
 * `apps/api`da ham bor xato, `docs/JOURNAL.md`ga alohida yozilgan). `key`
 * unikal bo'lgani uchun bitta yozuvlik `update()` bemalol ishlaydi.
 */
async function attachFile(relativeUrl: string, ownerType: string, ownerId: string): Promise<void> {
  const key = relativeUrl.replace('/api/files/', '');
  await db.mediaFile.update({ where: { key }, data: { ownerType, ownerId } });
}

/**
 * `upsert()` o'rniga: qayta ishga tushirilganda takror yozuv yaratilmasin
 * (bo'sh `update: {}` bilan upsert xuddi shu maqsadga xizmat qilardi).
 *
 * `upsert()` YOZILMAYDI — `PrismaNeonHTTP` bilan CREATE tarmog'ida xuddi
 * `updateMany()` kabi "Transactions are not supported in HTTP mode" bilan
 * yiqiladi (Prisma uni ichida SELECT+INSERT tranzaksiyasi sifatida quradi).
 */
async function createIfMissing<T>(
  find: () => Promise<T | null>,
  create: () => Promise<unknown>
): Promise<void> {
  const existing = await find();
  if (!existing) await create();
}

/** Kulrang gradatsiyalar palitrasi — har bir raqam bo'yicha boshqacha soya. */
function grayShade(n: number): string {
  const shades = ['#374151', '#4b5563', '#6b7280', '#78716c', '#57534e', '#44403c'];
  return shades[n % shades.length];
}

/** Yangilik rasmi: 1200×675, bir rangli fon + o'rtada "TEST NN". */
async function generateNewsImage(n: number): Promise<Uint8Array> {
  const label = String(n).padStart(2, '0');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${grayShade(n)}"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#g)"/>
    <text x="600" y="360" font-family="sans-serif" font-size="96" font-weight="bold"
          fill="#e5e7eb" text-anchor="middle">TEST ${label}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Xodim surati: 400×400, kulrang fon + siluet doira + raqam. Haqiqiy yuz emas. */
async function generateEmployeePhoto(n: number): Promise<Uint8Array> {
  const label = String(n).padStart(2, '0');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="400" height="400" fill="${grayShade(n)}"/>
    <circle cx="200" cy="160" r="70" fill="#9ca3af"/>
    <path d="M 80 380 Q 200 240 320 380 Z" fill="#9ca3af"/>
    <text x="200" y="200" font-family="sans-serif" font-size="40" font-weight="bold"
          fill="#1f2937" text-anchor="middle">${label}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Hamkor logotipi: 400×200, shaffof fon + neytral shakl + "HN" yorlig'i. */
async function generatePartnerLogo(n: number): Promise<Uint8Array> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
    <rect x="40" y="40" width="120" height="120" rx="16" fill="none"
          stroke="#6b7280" stroke-width="8"/>
    <circle cx="260" cy="100" r="55" fill="none" stroke="#6b7280" stroke-width="8"/>
    <text x="200" y="180" font-family="sans-serif" font-size="28" font-weight="bold"
          fill="#374151" text-anchor="middle">H${n}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Minimal, haqiqiy ochiladigan bir betlik PDF — kutubxonasiz, qo'lda tuzilgan. */
function generatePdf(title: string, bodyLines: string[]): Uint8Array {
  const escape = (s: string) => s.replace(/([()\\])/g, '\\$1');
  const contentLines = [
    'BT', '/F1 20 Tf', '50 760 Td', `(${escape(title)}) Tj`, 'ET',
    ...bodyLines.flatMap((line, i) => [
      'BT', '/F1 11 Tf', `50 ${700 - i * 20} Td`, `(${escape(line)}) Tj`, 'ET',
    ]),
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> ' +
      '/MediaBox [0 0 612 792] /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contentLines.length} >>\nstream\n${contentLines}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Uint8Array(Buffer.from(pdf, 'latin1'));
}

// --------------------------------------------------------------------------
// Kirill (ru) va lotin (uz/en) lorem
// --------------------------------------------------------------------------

const LOREM_RU =
  'Лорем ипсум долор сит амет, консектетур адипискинг элит. ' +
  'Сед до эйюсмод темпор инцидидунт ут лаборе эт долоре магна алиqua.';
const LOREM_UZ =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_EN =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

function contentHtml(n: number, withList: boolean, withImage: string | null): string {
  const parts = [
    `<p>${LOREM_UZ} ${n}.</p>`,
    `<p>${LOREM_UZ} Дуис ауте ируре долор ин репрехендерит.</p>`,
  ];
  if (withList) {
    parts.push(`<ul><li>${LOREM_UZ.slice(0, 30)}</li><li>Лорем ипсум ${n}</li><li>Band uchinchi</li></ul>`);
  }
  if (withImage) {
    parts.push(`<p><img src="${withImage}" alt="Test rasm ${n}" /></p>`);
  }
  parts.push(`<p><strong>Test band ${n}.</strong> ${LOREM_UZ}</p>`);
  return parts.join('\n');
}

// --------------------------------------------------------------------------
// Bosqich B — modellar
// --------------------------------------------------------------------------

/** Har bir laboratoriyaga taqsimlangan xodimlar soni: mudir + oddiy xodimlar. */
const LAB_UNITS = [
  'lab-energy-security', 'lab-power-systems', 'lab-renewable',
  'lab-electrotech', 'lab-efficiency', 'lab-smart-grid',
];
const LAB_STAFF_COUNTS = [2, 2, 2, 2, 2, 1]; // jami 11
const MANAGEMENT_UNITS = ['director', 'deputy-science', 'deputy-general', 'scientific-secretary'];
const ADMIN_UNITS = ['finance-dept', 'legal-counsel', 'hr-chancellery', 'ict-specialist', 'engineering-service'];
const ADMIN_STAFF_COUNTS = [2, 1, 2, 1, 1]; // jami 7

const POSITIONS = [
  'Katta ilmiy xodim', 'Ilmiy xodim', 'Kichik ilmiy xodim',
  'Yetakchi mutaxassis', 'Bosh mutaxassis', 'Mutaxassis',
];

async function seedEmployees(cache: MediaCache): Promise<void> {
  console.log('Xodimlar (29)...');
  const jobs: { id: string; unitId: string; isManagement: boolean; isUnitHead: boolean }[] = [];
  let n = 1;

  for (const unitId of MANAGEMENT_UNITS) {
    jobs.push({ id: `test-emp-${String(n).padStart(2, '0')}`, unitId, isManagement: true, isUnitHead: false });
    n++;
  }
  for (const unitId of LAB_UNITS) {
    jobs.push({ id: `test-emp-${String(n).padStart(2, '0')}`, unitId, isManagement: false, isUnitHead: true });
    n++;
  }
  LAB_UNITS.forEach((unitId, i) => {
    for (let k = 0; k < LAB_STAFF_COUNTS[i]; k++) {
      jobs.push({ id: `test-emp-${String(n).padStart(2, '0')}`, unitId, isManagement: false, isUnitHead: false });
      n++;
    }
  });
  jobs.push({ id: `test-emp-${String(n).padStart(2, '0')}`, unitId: 'integration-center', isManagement: false, isUnitHead: false });
  n++;
  ADMIN_UNITS.forEach((unitId, i) => {
    for (let k = 0; k < ADMIN_STAFF_COUNTS[i]; k++) {
      jobs.push({ id: `test-emp-${String(n).padStart(2, '0')}`, unitId, isManagement: false, isUnitHead: false });
      n++;
    }
  });

  for (let i = 0; i < jobs.length; i++) {
    const num = i + 1;
    const label = String(num).padStart(2, '0');
    const job = jobs[i];
    const hasPhoto = num <= 12; // 12 tasida bor, 17 tasida yo'q

    let photoUrl: string | null = null;
    if (hasPhoto) {
      const cacheKey = `employee-photo-${label}`;
      if (!cache[cacheKey]) {
        const bytes = await generateEmployeePhoto(num);
        cache[cacheKey] = await uploadFile(bytes, `test-employee-${label}.png`, 'photo', 'image/png');
      }
      photoUrl = cache[cacheKey];
      await attachFile(photoUrl, 'employee', job.id);
    }

    const hasDegree = num % 3 !== 0;
    const hasTitle = num % 4 === 0;
    const hasOrcid = num % 2 === 0;

    await createIfMissing(
      () => db.employee.findUnique({ where: { id: job.id } }),
      () => db.employee.create({ data: {
        id: job.id,
        fullNameUz: `Xodim ${label}`,
        fullNameEn: `Employee ${label}`,
        fullNameRu: `Сотрудник ${label}`,
        positionUz: POSITIONS[num % POSITIONS.length],
        positionEn: 'Researcher',
        positionRu: 'Научный сотрудник',
        degreeUz: hasDegree ? 'f.-m.f.n.' : null,
        degreeEn: hasDegree ? 'PhD' : null,
        degreeRu: hasDegree ? 'к.ф.-м.н.' : null,
        titleUz: hasTitle ? 'dotsent' : null,
        titleEn: hasTitle ? 'Associate Professor' : null,
        titleRu: hasTitle ? 'доцент' : null,
        email: `xodim${label}@example.invalid`,
        phone: `+998 00 000-00-${label}`,
        photoUrl,
        orcid: hasOrcid ? `0000-0000-0000-00${label}` : null,
        scopusId: hasOrcid ? `1000000000${num}` : null,
        researchAreaUz: `Test tadqiqot yo'nalishi ${label}`,
        researchAreaEn: `Test research area ${label}`,
        researchAreaRu: `Тестовое направление ${label}`,
        officeRoom: `${100 + num}`,
        receptionHoursUz: 'Dushanba, 15:00 – 17:00',
        receptionHoursEn: 'Monday, 3:00 PM – 5:00 PM',
        receptionHoursRu: 'Понедельник, 15:00 – 17:00',
        isManagement: job.isManagement,
        isUnitHead: job.isUnitHead,
        unitId: job.unitId,
        order: num,
        isActive: true,
      } })
    );
  }
  console.log(`✓ ${jobs.length} xodim tayyor`);
}

async function seedPartners(cache: MediaCache): Promise<void> {
  console.log('Hamkorlar (8)...');
  for (let num = 1; num <= 8; num++) {
    const cacheKey = `partner-logo-${num}`;
    if (!cache[cacheKey]) {
      const bytes = await generatePartnerLogo(num);
      cache[cacheKey] = await uploadFile(bytes, `test-partner-${num}.png`, 'image', 'image/png');
    }
    const id = `test-partner-${String(num).padStart(2, '0')}`;
    await attachFile(cache[cacheKey], 'partner', id);
    await createIfMissing(
      () => db.partner.findUnique({ where: { id } }),
      () => db.partner.create({ data: {
        id,
        nameUz: `Hamkor tashkilot ${num}`,
        nameEn: `Partner organization ${num}`,
        nameRu: `Партнёрская организация ${num}`,
        logoUrl: `${API_URL}${cache[cacheKey]}`,
        websiteUrl: num % 2 === 0 ? `https://partner${num}.example.invalid` : null,
        order: num,
        isActive: true,
      } })
    );
  }
  console.log('✓ 8 hamkor tayyor');
}

const NEWS_CATEGORIES_HINT = ['ilmiy', 'hamkorlik', 'ta\'lim', 'infratuzilma'];

async function seedNews(cache: MediaCache): Promise<void> {
  console.log("Yangiliklar (12)...");
  for (let num = 1; num <= 12; num++) {
    const label = String(num).padStart(2, '0');
    const id = `test-news-${label}`;
    const hasImage = num > 2; // 2 tasida yo'q
    let imageUrl: string | null = null;
    if (hasImage) {
      const cacheKey = `news-image-${label}`;
      if (!cache[cacheKey]) {
        const bytes = await generateNewsImage(num);
        cache[cacheKey] = await uploadFile(bytes, `test-news-${label}.png`, 'image', 'image/png');
      }
      // News.imageUrl TO'LIQ manzil bo'lishi shart (server `.url()` talab qiladi).
      imageUrl = `${API_URL}${cache[cacheKey]}`;
      await attachFile(cache[cacheKey], 'news', id);
    }

    const withList = num === 1;
    const contentImageKey = num === 2 ? cache[`news-image-03`] : null;
    const isPublished = num <= 10; // oxirgi 2 tasi qoralama
    const hasSource = num === 5 || num === 6;

    await createIfMissing(
      () => db.news.findUnique({ where: { slug: id } }),
      () => db.news.create({ data: {
        slug: id,
        titleUz: `Test yangilik ${label}`,
        titleEn: `Test news ${label}`,
        titleRu: `Тестовая новость ${label}`,
        summaryUz: `${LOREM_UZ.slice(0, 80)} (${label})`,
        summaryEn: `${LOREM_EN.slice(0, 80)} (${label})`,
        summaryRu: `${LOREM_RU.slice(0, 90)} (${label})`,
        contentUz: contentHtml(num, withList, contentImageKey),
        contentEn: contentHtml(num, withList, contentImageKey),
        contentRu: contentHtml(num, withList, contentImageKey),
        imageUrl,
        sourceName: hasSource ? "O'zA — O'zbekiston Milliy axborot agentligi (TEST)" : null,
        sourceUrl: hasSource ? 'https://example.invalid/test-source' : null,
        isPublished,
        publishedAt: new Date(Date.UTC(2025, (num - 1) % 12, (num * 2) % 27 + 1)),
      } })
    );
  }
  console.log('✓ 12 yangilik tayyor (10 nashr etilgan, 2 qoralama)');
}

const PUB_CATEGORIES: { category: string; count: number }[] = [
  { category: 'article', count: 7 },
  { category: 'conference', count: 3 },
  { category: 'monograph', count: 2 },
  { category: 'patent', count: 2 },
  { category: 'report', count: 1 },
];

async function seedPublications(cache: MediaCache): Promise<void> {
  console.log("Nashrlar (15)...");
  const plan: string[] = [];
  for (const { category, count } of PUB_CATEGORIES) {
    for (let i = 0; i < count; i++) plan.push(category);
  }
  for (let num = 1; num <= 15; num++) {
    const label = String(num).padStart(2, '0');
    const id = `test-pub-${label}`;
    const hasFile = num <= 10; // 5 tasida yo'q
    let fileUrl: string | null = null;
    if (hasFile) {
      const cacheKey = `pub-doc-${label}`;
      if (!cache[cacheKey]) {
        const pdf = generatePdf(`TEST NASHR ${label}`, [LOREM_UZ, LOREM_RU]);
        cache[cacheKey] = await uploadFile(pdf, `test-pub-${label}.pdf`, 'document', 'application/pdf');
      }
      fileUrl = `${API_URL}${cache[cacheKey]}`;
      await attachFile(cache[cacheKey], 'publication', id);
    }
    const year = 2019 + ((num * 3) % 8); // 2019..2026 oralig'ida tarqoq

    await createIfMissing(
      () => db.publication.findUnique({ where: { id } }),
      () => db.publication.create({ data: {
        id,
        titleUz: `Test nashr sarlavhasi ${label}`,
        titleEn: `Test publication title ${label}`,
        titleRu: `Тестовое название публикации ${label}`,
        authors: 'Muallif A., Muallif B.',
        journal: num % 3 === 0 ? null : `Test jurnali ${(num % 4) + 1}`,
        year,
        doi: `10.0000/test.${String(1000 + num)}`,
        fileUrl,
        category: plan[num - 1],
      } })
    );
  }
  console.log('✓ 15 nashr tayyor');
}

const DOC_CATEGORIES = ['order', 'regulation', 'charter', 'report', 'other'];

async function seedDocuments(): Promise<void> {
  console.log("Hujjatlar (10)...");
  for (let num = 1; num <= 10; num++) {
    const label = String(num).padStart(2, '0');
    const id = `test-doc-${label}`;
    const cacheKey = `document-file-${label}`;
    const cache = await loadCache();
    if (!cache[cacheKey]) {
      const pdf = generatePdf(`TEST HUJJAT ${label}`, [LOREM_UZ, LOREM_RU, `Hujjat raqami: TEST-${label}`]);
      cache[cacheKey] = await uploadFile(pdf, `test-doc-${label}.pdf`, 'document', 'application/pdf');
      await saveCache(cache);
    }
    const fileKey = cache[cacheKey].replace('/api/files/', '');
    await attachFile(cache[cacheKey], 'document', id);

    await createIfMissing(
      () => db.document.findUnique({ where: { id } }),
      () => db.document.create({ data: {
        id,
        titleUz: `Test hujjat ${label}`,
        titleEn: `Test document ${label}`,
        titleRu: `Тестовый документ ${label}`,
        descriptionUz: `${LOREM_UZ} (${label})`,
        descriptionEn: `${LOREM_EN} (${label})`,
        descriptionRu: `${LOREM_RU} (${label})`,
        fileKey,
        documentNumber: `TEST-${label}`,
        documentDate: new Date(Date.UTC(2024 + (num % 3), num % 12, (num % 27) + 1)),
        category: DOC_CATEGORIES[num % DOC_CATEGORIES.length],
        order: num,
        isActive: true,
      } })
    );
  }
  console.log('✓ 10 hujjat tayyor');
}

const MESSAGE_STATUSES = ['new', 'in_review', 'answered', 'closed', 'new'];

async function seedContactMessages(): Promise<void> {
  console.log('Murojaatlar (5)...');
  for (let num = 1; num <= 5; num++) {
    const ticketNumber = `M-2026-900${num}`;
    const status = MESSAGE_STATUSES[num - 1];
    await createIfMissing(
      () => db.contactMessage.findUnique({ where: { ticketNumber } }),
      () => db.contactMessage.create({ data: {
        ticketNumber,
        name: `Murojaatchi ${num}`,
        email: `murojaat${num}@example.invalid`,
        phone: num % 2 === 0 ? `+998 00 111-00-0${num}` : null,
        subject: `Test murojaat mavzusi ${num}`,
        message: `${LOREM_UZ} ${LOREM_RU} (murojaat ${num})`,
        status,
        answeredAt: status === 'answered' || status === 'closed' ? new Date() : null,
        answerNote: status === 'answered' || status === 'closed' ? `Test javob izohi ${num}` : null,
      } })
    );
  }
  console.log('✓ 5 murojaat tayyor (new, in_review, answered, closed, new)');
}

async function seedErrorLogs(): Promise<void> {
  console.log('Xatolik jurnali (3, ixtiyoriy)...');
  for (let num = 1; num <= 3; num++) {
    const fingerprint = `test-error-${num}`;
    await createIfMissing(
      () => db.errorLog.findUnique({ where: { fingerprint } }),
      () => db.errorLog.create({ data: {
        fingerprint,
        source: num === 3 ? 'client' : 'server',
        level: num === 2 ? 'warning' : 'error',
        code: `TEST_ERROR_${num}`,
        message: `Test xatolik xabari ${num} — ${LOREM_EN}`,
        path: `/api/test-${num}`,
        method: 'GET',
        statusCode: 500,
        count: num,
      } })
    );
  }
  console.log('✓ 3 test xatolik tayyor');
}

async function reindexAll(): Promise<void> {
  console.log('Qidiruv indeksi qayta hisoblanmoqda...');
  for (const table of SEARCH_TABLES) {
    await db.$executeRawUnsafe(reindexAllSql(table));
  }
  console.log('✓ Qidiruv indeksi yangilandi');
}

async function main(): Promise<void> {
  console.log(`Test ma'lumotlari to'ldirilmoqda (API: ${API_URL})...\n`);

  const cache = await loadCache();
  await seedEmployees(cache);
  await saveCache(cache);
  await seedPartners(cache);
  await saveCache(cache);
  await seedNews(cache);
  await saveCache(cache);
  await seedPublications(cache);
  await saveCache(cache);
  await seedDocuments();
  await seedContactMessages();
  await seedErrorLogs();
  await reindexAll();

  console.log('\n✅ Test ma\'lumotlari tayyor.');
  console.log('Tozalash: npm run db:test:clean');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ Test ma\'lumotlari yozilmadi:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
