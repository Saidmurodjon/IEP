# Hostingga deploy (DirectAdmin + CloudLinux + Node.js) — to'liq qo'llanma

Bu hujjat saytni **yangi hosting hisobiga** (masalan, yuridik shaxs kabinetida ochilgan
hisobga) noldan joylash uchun. 2026-09-23 da webname (`web2.webspace.uz`) hostingida
sinovdan o'tgan tartib shu yerda yozilgan. **Secret qiymatlari bu faylga YOZILMAYDI.**

---

## 0. Holat va qaror (2026-09-23)

- Sayt webname hostingida **production sifatida sinovdan o'tdi**: sinov domeni
  `https://iep-95-46-96-12.sslip.io`, API `https://api.iep-95-46-96-12.sslip.io`.
  Natija: API 15–25 ms, sahifa LCP 0,3–0,7 s (tezkor internet), 3G'da 1,9–3,3 s;
  10 parallel foydalanuvchida 200 so'rovdan 0 ta xato. Batafsil — `docs/JOURNAL.md`.
- **Qaror:** hozirgi holat yetarli. Keyingi qadam — `iep.uz` domenini **yuridik shaxs
  nomidan** sotib olish, **Arsenal-D** orqali ro'yxatdan o'tkazish, hosting olish va
  saytni yuridik shaxs kabinetida shu qo'llanma bo'yicha ishga tushirish.
- ⚠️ Joriy sinov hostingi (`iepuz`, Brillant 10G) muddati: **28.09.2026**. Undagi baza va
  media — ko'chirish uchun manba (7-bo'lim). Muddat tugashidan oldin zaxira oling.

## 0a. Arsenal-D / yangi hisob ma'lumotlari (to'ldiriladi)

Faqat maxfiy bo'lmagan ma'lumot. Parollar — parol menejerida, bu yerda emas.

| Nima | Qiymat |
|---|---|
| Registrator / hosting | Arsenal-D |
| Kabinet manzili | _(to'ldiring)_ |
| Yuridik shaxs (STIR) | _(to'ldiring)_ |
| Hosting paneli (DirectAdmin) manzili | _(masalan `https://webN.<host>:2222/evo/`)_ |
| Server hostname / IP | _(panelda «Server nomi / IP»)_ |
| Hosting foydalanuvchi nomi | _(panel login'i)_ |
| NS serverlari | _(hosting beradi, masalan `dns1–4.<host>`)_ |
| Hosting muddati | _(to'ldiring)_ |
| Domen muddati | _(to'ldiring)_ |

---

## 1. Maqsadli tuzilma

| Qism | Manzil | Serverda |
|---|---|---|
| Frontend (statik) | `https://iep.uz` | `~/domains/iep.uz/public_html` |
| API | `https://api.iep.uz` | Node.js ilova, root `~/iep-api` |
| Media fayllar | — | `~/iep-media` (`public_html` dan TASHQARIDA) |
| Baza | — | hostingning PostgreSQL'i, `localhost:5432` |

## 2. Domen va DNS

1. Domen registrator kabinetida **NS** yozuvlarini hostingning nom serverlariga qo'ying
   (hosting paneli DNS zonasidagi `NS` yozuvlari). Tarqalish: bir necha soat – 24 soat.
2. Hosting DNS zonasida A-yozuvlar serverning IP'siga: `@`, `www`, `api`.
   (2026-09-23 da `www` yozuvi zonada YO'Q edi — qo'shish kerak.)
3. Tekshirish: `dig +short iep.uz @1.1.1.1`, `dig +short api.iep.uz @8.8.8.8`,
   `dig +short NS iep.uz @1.1.1.1`.

## 3. SSH (Claude Code uchun)

1. Mac'da kalit: `ssh-keygen -t ed25519 -f ~/.ssh/iep_<hisob> -N "" -C "claude-code-iep"`.
2. Panel → **Kengaytirilgan xususiyatlar → SSH kalitlari → KALITNI JOYLASHTIRISH**
   (KALIT YARATISH emas!), ochiq kalitni qo'ying, «Ruxsat berish» belgilansin.
3. Ulanish: `ssh -i ~/.ssh/iep_<hisob> -o IdentitiesOnly=yes <user>@<server>` (port 22;
   2222 — panel porti). Kalit qo'shilgach bir necha daqiqa `shell request failed`
   chiqishi mumkin — kuting.

## 4. Panelda sozlash (tartib bilan)

1. **Domain Setup:** `iep.uz`. **Subdomains:** `api`.
2. **SSL Certificates:** Let's Encrypt — `iep.uz`, `www.iep.uz`, `api.iep.uz`.
   DNS tarqalmaguncha sertifikat chiqmaydi. Chiqqandan keyin **Force SSL** yoqiladi.
3. **PostgreSQL:** baza + foydalanuvchi yarating. Versiya ≥ 12 (`tsvector`/GIN).
   Foydalanuvchida `CREATE` huquqi bo'lsin.
4. **Setup Node.js App:**
   - Node versiyasi **22**, mode **Production**
   - Application root: `iep-api`
   - Application URL: `api.iep.uz`
   - Startup file: `server.cjs`
   - Muhit o'zgaruvchilari (5-bo'lim)

## 5. Muhit o'zgaruvchilari (Node.js App formasi)

| Nomi | Qiymat formati | Eslatma |
|---|---|---|
| `DATABASE_URL` | `postgresql://USER:PAROL@localhost:5432/BAZA` | `postgresql:` dan keyin **ikkita** `//`. Paroldagi `@ : / # ? %` URL-kodlanadi (`@` → `%40`) |
| `JWT_SECRET` | ≥ 32 belgi, `openssl rand -hex 32` | Yangi yarating, hech qayerga ko'chirmang, chatga yozmang |
| `FRONTEND_URL` | `https://iep.uz` | **Bosh/oxirgi bo'sh joysiz**, oxirida `/` yo'q — aks holda CORS ishlamaydi |
| `MEDIA_DIR` | `/home/<user>/iep-media` | Papka `public_html` dan tashqarida |
| `RESEND_API_KEY` | Resend kaliti | Kontakt formasi xatlari uchun |
| `MAIL_FROM` | masalan `IEP <noreply@iep.uz>` | Resend'da domen tasdiqlangan bo'lsin |
| `DB_CONNECTION_LIMIT` | ixtiyoriy, standart `2` | Hosting ulanish limitiga qarab |
| `TOKIO_WORKER_THREADS` | ixtiyoriy, standart `2` (kodda) | Oshirmang — 9-bo'limga qarang |

Saqlagandan keyin **Restart**.

## 6. Build va yuklash (Mac'da)

```bash
# API paketi → apps/api/deploy/iep-api/ (+ iep-api.zip)
npm run build:node --workspace=apps/api
# Media (lokal wrangler R2 dan) → apps/api/deploy/iep-media.tar.gz
npm run export:media --workspace=apps/api
# Frontend
cd apps/web && VITE_API_URL=https://api.iep.uz npx vite build --outDir dist-webname --emptyOutDir
```

Serverga (SSH bo'lsa):
```bash
# API: server.cjs, package.json, prisma/ → ~/iep-api
scp -r apps/api/deploy/iep-api/{server.cjs,package.json,prisma} <user>@<server>:iep-api/
# serverda:  source ~/nodevenv/iep-api/22/bin/activate && cd ~/iep-api
#            npm install && npm run generate      # postinstall EMAS — CloudLinux sababli
# Frontend (macOS ._* fayllari tushmasligi uchun COPYFILE_DISABLE):
cd apps/web/dist-webname && COPYFILE_DISABLE=1 tar --exclude=_headers --exclude=_redirects -czf - . \
  | ssh <user>@<server> 'cd ~/domains/iep.uz/public_html && tar -xzf - --no-same-owner'
```
SSH bo'lmasa — panel **Fayl menejeri**: `server.cjs` → `iep-api/`, frontend zip →
`domains/iep.uz/public_html/` (eski `assets/` ni avval o'chiring) → Extract.
`api.iep.uz/public_html/.htaccess` — Passenger sozlamasi, unga TEGMANG.

## 7. Baza va media ko'chirish

- **Joriy hostingdan** (eng yangi ma'lumot shu yerda): serverda
  `pg_dump "$DATABASE_URL" --schema=public --no-owner --no-privileges > iep-full.sql`,
  keyin `sed -i -E '/^CREATE SCHEMA public;|^COMMENT ON SCHEMA public/d' iep-full.sql`.
- **Yangi hostingda:** `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f iep-full.sql`.
  To'liq dump (sxema + ma'lumot + `_prisma_migrations`) superuser talab qilmaydi.
  Keyingi sxema o'zgarishlari: `npm run migrate` (`~/iep-api` da).
- **Media:** joriy serverdagi `~/iep-media` ni to'liq ko'chiring
  (`tar -czf iep-media.tar.gz -C ~/iep-media .`). Admin panel orqali keyin yuklangan
  fayllar lokal R2 da YO'Q — `export:media` faqat birinchi ko'chirish uchun edi.
- Dump va arxivlar maxfiy ma'lumotga ega (murojaatlar) — ishdan keyin o'chiring.

## 8. Tekshiruv

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://api.iep.uz/api/news
curl -sS -D - -o /dev/null -H "Origin: https://iep.uz" https://api.iep.uz/api/news | grep -i access-control-allow-origin
for i in $(seq 1 12); do curl -s -o /dev/null -w "%{http_code} " https://api.iep.uz/api/settings & done; wait
curl -sS -I https://iep.uz/ | grep -iE "strict-transport|x-frame|content-security"
```
Kutilgan: 200; `access-control-allow-origin: https://iep.uz`; 12 ta 200; sarlavhalar bor.
Qo'lda: admin login, fayl yuklash, kontakt formasi (xat keladimi), qidiruv, rasmlar.
Serverda: `ps -u <user> -o pid,nlwp,etime,cmd | grep NodeApp` — oqimlar ~15, jarayon
daqiqalab yashaydi (bir necha soniyada qayta tug'ilsa — 9-bo'lim).

## 9. Ma'lum tuzoqlar (hammasi 2026-09-23 da uchragan)

| Belgi | Sabab | Yechim |
|---|---|---|
| Hamma API so'rovi 500, `URL must start with postgresql://` | `DATABASE_URL` da bitta `/` | Formada `postgresql://` |
| Sahifa ochiladi, ma'lumot yo'q; CORS sarlavhasi yo'q | `FRONTEND_URL` boshida bo'sh joy | Bo'sh joyni o'chirib Restart |
| 4-parallel so'rovdan 500, har biri roppa-rosa 5 s | Prisma pool hosting ulanish limitidan oshadi | Kodda `connection_limit=2` (tayyor) |
| NodeApp jarayonlari 4–12 s yashaydi, SSH `Connection reset by peer` | CloudLinux LVE oqimlarni sanaydi; Prisma tokio yadro soniga teng oqim ochadi (~52) | Kodda `TOKIO_WORKER_THREADS=2` (tayyor) |
| Rasmlar ko'rinmaydi | `<img>` nisbiy `/api/files/` yoki bazada `localhost:3000` | `fileUrl()` (tayyor) |
| Serverda `._*` fayllar | macOS tar AppleDouble | `COPYFILE_DISABLE=1` |
| `!` bilan buyruq Terminal'da ishlamadi | `!` faqat Claude Code oynasida | Terminal'da `!` siz |
| Server terminalida `ssh ... iep_webname` parol so'raydi | Buyruq Mac'da emas, serverda terilgan | Mac Terminal'da |
| Claude Code serverga yozolmaydi | auto-mode production'ga yozishni bloklaydi | Buyruqni foydalanuvchi ishga tushiradi yoki Fayl menejeri |

## 10. Ochiq ishlar (keyinroq)

- `/images/` statik rasmlarida `Cache-Control` yo'q — har tashrifda ~600 KB qayta yuklanadi;
  rasmlarni WebP'ga o'tkazish (hero 334 KB, logo 117 KB).
- Asosiy JS bundle 505 KB (gzip 161 KB) — bo'laklarga ajratish.
- Hosting o'zi ham sarlavha qo'shadi (`X-Frame-Options: SAMEORIGIN` — biznikidan farqli).
- Rate limit xotirada — Passenger bir nechta jarayon ochsa, limit har biriga alohida.
- Baza zaxirasi: kunlik `pg_dump` cron (7 kun saqlash) — hali sozlanmagan.
