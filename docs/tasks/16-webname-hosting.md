# 16 — webname.uz hostingiga ko'chish

**Holat:** ✅ production sinovidan o'tdi (2026-09-23, sslip.io sinov domenida). Qaror:
`iep.uz` yuridik shaxs nomidan Arsenal-D orqali, yangi hosting kabinetida — qo'llanma
`docs/deploy-hosting.md`. D bosqichi (domen) shu yangi hisobda bajariladi.

**Qaror (2026-09-23, foydalanuvchi):** API webname'ning Node.js ilovasiga (cPanel +
Passenger, Node 22) ko'chadi. Frontend `public_html` ga ko'chadi. SSH (Terminal) bor.
**Baza ham webname'ning PostgreSQL'iga ko'chadi** (cPanel → PostgreSQL Management) —
Neon'dan voz kechiladi, barcha ma'lumot O'zbekistondagi serverda.

## Maqsadli tuzilma

| Qism | Manzil | Qayerda |
|---|---|---|
| Frontend (statik) | `https://iep.uz` | `/home/iepuz/domains/iep.uz/public_html` |
| API | `https://api.iep.uz` | Node.js ilova, root `/home/iepuz/iep-api` |
| Media fayllar | — | `/home/iepuz/iep-media` (public_html dan TASHQARIDA) |
| Baza | — | webname PostgreSQL (`localhost:5432`, faqat server ichidan) |

## Asosiy tamoyil — Workers versiyasi buzilmaydi

Kod bitta bo'lib qoladi. Workers'ga xos narsalar faqat ikki joyda: `c.env` (sozlamalar)
va `MEDIA` (R2). Node uchun alohida kirish nuqtasi yoziladi. U `process.env` dan xuddi
shu `Env` obyektini yig'adi, `MEDIA` o'rniga esa diskda ishlaydigan ombor beradi.
Routelar o'zgarmaydi. Ko'chish tasdiqlanmaguncha Cloudflare zaxira bo'lib turadi.

## Bosqichlar

**A. Kod (lokal, deploy'siz)**
1. `apps/api/src/lib/fs-storage.ts`: R2 ning ishlatiladigan qismi (`put`, `get`,
   `delete`), diskka yozadi. Content-Type yonidagi `.meta.json` da saqlanadi. Kalit
   `isValidKey()` dan o'tadi, `path traversal` sinovi yoziladi.
2. `apps/api/src/node.ts`: `@hono/node-server` bilan ishga tushiriladi. `Env`
   `process.env` dan yig'iladi, yetishmagan secret bo'lsa ishga tushmaydi (fail closed).
   `MEDIA_DIR` o'rnatilgan bo'lsa `MEDIA = fsStorage(MEDIA_DIR)`.
3. `apps/api/src/index.ts` dagi `R2Bucket` tipi kichik interfeysga almashtiriladi.
   Ikkala ombor ham shu interfeysni bajaradi.
3a. `lib/db.ts`: Node kirish nuqtasi oddiy Postgres uchun o'z `PrismaClient` ini
   beradi (Neon HTTP drayverisiz, `connection_limit` bilan). Workers yo'li o'zgarmaydi.
4. Build: esbuild kodni `@energetika/shared` bilan birga bitta `dist-node/server.cjs`
   fayliga yig'adi. `@prisma/client` tashqarida qoladi. Deploy uchun alohida
   `package.json` yoziladi: `@prisma/client`, `prisma` (migratsiya uchun), schema va
   `migrations/` papkasi.
5. Skript `npm run build:node --workspace=apps/api` → `deploy/iep-api.zip`.
6. Sinov: lokalda `node server.cjs` ishga tushadi, keyin login, yangiliklar, fayl
   yuklash va o'qish haqiqiy HTTP so'rov bilan tekshiriladi.

**B. Frontend**
7. `apps/web/public/.htaccess`: SPA fallback (`index.html`) va `_headers` dagi barcha
   sarlavhalar (CSP Report-Only ham). Apache `mod_headers`.
8. `VITE_API_URL=https://api.iep.uz npx vite build --outDir dist-webname` bilan build qilinadi. CSP `connect-src` ga
   `https://api.iep.uz` qo'shiladi.

**C. Server (foydalanuvchi + Claude, SSH orqali)**
9. cPanel → Subdomains → `api.iep.uz`. SSL (AutoSSL / Let's Encrypt) `iep.uz` va
   `api.iep.uz` uchun.
10. Node.js ilova formasi:
    - version 22, mode Production
    - root `iep-api`
    - URL `api.iep.uz`
    - startup file `server.cjs`
    - log `/home/iepuz/logs/iep-api.log`
    - env: `DATABASE_URL`, `JWT_SECRET` (≥32 belgi), `FRONTEND_URL=https://iep.uz`,
      `MEDIA_DIR=/home/iepuz/iep-media`, `RESEND_API_KEY`, `MAIL_FROM`
10a. PostgreSQL Management: baza + foydalanuvchi yaratiladi, versiya tekshiriladi
    (`tsvector`/GIN uchun ≥ 12). Foydalanuvchida `CREATE` huquqi bo'lsin (migratsiya).
11. Zip yuklanadi (`npm run build:node --workspace=apps/api` → `apps/api/deploy/iep-api.zip`),
    ochiladi, "Run NPM Install" (postinstall `prisma generate` qiladi).
11a. Baza: `migrate deploy` EMAS — to'liq dump tiklanadi (sxema + ma'lumot +
    `_prisma_migrations`), lokalda sinab ko'rilgan usul:
    ```
    docker exec iep-pg pg_dump -U postgres -d energetika_mig --schema=public \
      --no-owner --no-privileges > iep-full.sql
    sed -i '' -E '/^CREATE SCHEMA public;|^COMMENT ON SCHEMA public/d' iep-full.sql
    # serverda (SSH):
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f iep-full.sql
    ```
    Sabab: `--data-only` + `--disable-triggers` superuser talab qiladi (hostingda yo'q),
    `structure_units` o'ziga FK bilan bog'langan. To'liq dumpda FK'lar ma'lumotdan KEYIN
    qo'shiladi — oddiy foydalanuvchi yetarli. `--schema=public` Neon proksisining
    `neon_control_plane` sxemasini chiqarib tashlaydi. Keyingi sxema o'zgarishlari
    serverda `npm run migrate` bilan.
12. `dist/` `domains/iep.uz/public_html` ga yuklanadi. (Panel DirectAdmin uslubida: subdomen `api.iep.uz` hujjat ildizi — Standart `domains/api.iep.uz/public_html`; Node ilova root undan alohida `iep-api`.)
13. Media fayllar: `media_files` da 45 ta yozuv, baytlari lokal wrangler R2 holatida
    (`.wrangler/state`). Ular `MEDIA_DIR/<key>` + `<key>.meta.json` shakliga eksport
    qilinishi kerak — `npm run export:media --workspace=apps/api` → `deploy/iep-media.tar.gz`
    (✅ 45 fayl serverga yuklandi, bayt bo'yicha tekshirildi).

**D. Domen**
14. `iep.uz` DNS A-yozuvlari webname serveriga qaratiladi (`@`, `www`, `api`).
15. Tekshiruv: sahifalar, admin login, fayl yuklash, kontakt formasi, qidiruv,
    `curl -I` bilan sarlavhalar.

## Xavflar va cheklovlar

- **Rate limit xotirada.** Passenger bir necha jarayon ochsa, limit har bir jarayonga
  alohida hisoblanadi. Yechim: ilovani 1 jarayonga cheklash yoki limitni bazaga ko'chirish.
- **Prisma query engine** CloudLinux'da `rhel-openssl-*` binari bilan ishlaydi.
  `binaryTargets` ga qo'shiladi va A-6 bosqichida serverda tekshiriladi.
- **Secret'lar** faqat cPanel formasida kiritiladi. Repoga va zip'ga tushmaydi.
- Bazaning zaxira nusxasi (backup) endi bizning zimmamizda — Neon'dagidek avtomatik emas.
  cPanel backup yoki `pg_dump` cron (kunlik, 7 kun saqlash) sozlanadi.
- Baza porti tashqariga ochilmaydi; migratsiya faqat SSH ichidan.
- Hisob nomi `iepuz` yo'llarda skrinshotdan olingan, serverda tasdiqlanadi.
