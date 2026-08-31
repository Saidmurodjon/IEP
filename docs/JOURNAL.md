# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-31
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11, 06, 07, 08, 09 va 10A
kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **09 PM tomonidan QABUL QILINDI.**
- **10A — sayt bo'ylab to'liq matnli qidiruv tayyor.** `GET /api/search` (ochiq, IP bo'yicha
  daqiqasiga 30 ta): `q` (≥2 belgi), `type`, `from`, `to`, `lang`, `page`, `limit`.
  Natijalar bo'limlar bo'yicha guruhlanadi, topilgan so'z `<mark>` bilan belgilanadi.
- **Baza:** migratsiya `7_search_vectors` — 5 jadvalda `searchVector tsvector` + GIN indeks.
  Lug'at `simple` (o'zbek lug'ati yo'q), qidiruv prefiks bo'yicha (`so'z:*`), shuning uchun
  o'zbek/rus qo'shimchalari ham topiladi. Vazn: sarlavha `A`, tavsif `B`, matn `C`.
- **Indeks trigger bilan emas, kodda:** `packages/shared/src/search-vectors.ts` (yagona manba)
  → `apps/api/src/lib/search-index.ts` `reindex()`, har bir `create`/`update` dan keyin.
  Seed va demo skriptlari ham indeksni qayta quradi.
- **Frontend:** `/search` sahifasi (so'rov va filtrlar manzilda), sarlavhada qidiruv maydoni
  (mobil ko'rinishda ikonka), 300 ms kechikish, `↓`/`↑`/`Enter`/`Escape` klaviatura,
  `aria-live`, parcha faqat `<mark>` bilan (DOMPurify).
- **`apps/api/.dev.vars` endi LOKAL bazaga qaraydi.** Production nusxasi `.dev.vars.production`
  da; ikkalasi ham `.gitignore` da (`.dev.vars`, `.dev.vars.*`).

### Nima hali ishlamaydi / bajarilmagan
- **10B (imkoniyati cheklanganlar) va 10C (xavfsizlik sarlavhalari) boshlanmagan.**
- **Bu muhitda hostda `node`/`npm` PATH da yo'q.** Butun tekshiruv Docker orqali bajarildi:
  `postgres:16` (5433), `node:20` konteyneri, `local-neon-http-proxy` (Prisma Neon HTTP
  drayveri oddiy Postgres bilan gaplasha olmaydi), `puppeteer` konteyneri. Batafsil —
  quyidagi yozuv.
- **`RESEND_API_KEY` va `MAIL_FROM` o'rnatilmagan** — haqiqiy xat hali yuborilmadi.
- **R2 bucket production'da yaratilmagan**, **migratsiyalar 2–7 production'ga qo'llanmagan.**
- Murojaatlarni saqlash muddati yuriskonsultdan kutilmoqda. Cron sozlanmagan.
- Throttle va rate limitlar izolyat xotirasida (KV/Durable Object kerak).
- Testlar `redact.ts`, `rate-limit.ts` va `search-index.ts` ni qamraydi (43 ta), CI yo'q.
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda
  (`docs/kerakli-malumotlar.md`).

### Keyingi qadam
1. 10A ni PM tekshirsin.
2. 10B — imkoniyati cheklangan shaxslar uchun qulayliklar (alohida kommit).
3. 10C — xavfsizlik sarlavhalari va CSP (alohida kommit).

### Ochiq savollar
- Yopilgan murojaatlarni qancha muddat saqlash kerak? **Yuriskonsult javobi kutilmoqda.**
- Murojaat bildirishnomalari uchun alohida pochta manzili bormi (`appeals_email` sozlamasi)?
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?
- Nashrlar/hujjatlar/xodimlar uchun alohida sahifa yo'q — qidiruv natijasi ro'yxat
  sahifasiga olib boradi. Alohida sahifalar kerakmi?

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 11 | Logotip, 404, huquqiy bandlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 06 | Xodimlar, laboratoriyalar, hamkorlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 07 | Fayl yuklash va tahrirlagich | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 08 | Xatoliklar jurnali | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 09 | Murojaatlar va Resend | ✅ **Qabul qilindi** |
| 10A | Sayt bo'ylab qidiruv | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 10B | Imkoniyati cheklanganlar uchun qulayliklar | ⏳ Navbatda |
| 10C | Xavfsizlik sarlavhalari va CSP | ⏳ Navbatda |

03-production alohida turadi va `wrangler login` dan keyin bajariladi.

**Foydalanuvchi zimmasidagi ochiq masalalar** (batafsil: `docs/kerakli-malumotlar.md`). 373-son qaror bo'yicha
yuriskonsult javobi. **Logotipning vektor fayli (SVG/AI/EPS) yoki 1000px shaffof PNG** va brend qo'llanmasi. Xodimlar ma'lumoti va rasmlari. Hamkorlar ro'yxati. Institut telefon raqami.

---

## HOZIRDA KIM NIMA USTIDA ISHLAYAPTI

> Bir vaqtda bir nechta sessiya ishlaganda to'qnashuvni oldini olish uchun.
> Ish boshlashda o'zingizni qo'shing, tugaganda o'chiring.

| Sessiya | Topshiriq | Tegilayotgan fayllar | Boshlangan |
|---|---|---|---|
| — | — | — | — |

---

## YOZUVLAR

> Eng yangisi tepada. Har bir yozuv qisqa bo'lsin — nima qilindi, nima tekshirildi, nima qolib ketdi.

### 2026-08-31 · 10A — Sayt bo'ylab to'liq matnli qidiruv

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(search): full text search across the site`

**Xavfsizlik (kommitsiz — fayllar `.gitignore` da).** `apps/api/.dev.vars` production Neon'ga
qaragan edi → lokal Postgres; production nusxasi `.dev.vars.production` da (wrangler o'qimaydi).
**Root `.env` HALI production'ga qaraydi** — `prisma migrate`/`seed` shuni oladi, ehtiyot bo'ling.

**Nima qilindi.** Migratsiya `7_search_vectors`: 5 jadvalda `searchVector tsvector` + GIN indeks
+ backfill. SQL ifodalari `packages/shared/src/search-vectors.ts` da — API, seed va migratsiya
uchun yagona manba. `routes/search.ts` (UNION ALL, `ts_rank`, `ts_headline` → `<mark>`, bo'lim/
sana filtri, sahifalash, IP 30/daqiqa), `lib/search-index.ts` (`reindex()`), `lib/rate-limit.ts`
(uchta nusxa o'rniga bitta). Frontend: `/search` sahifasi, sarlavhadagi maydon, 300 ms kechikish,
klaviatura, `aria-live`, `sanitizeSnippet` (faqat `<mark>`), i18n 323 kalit uchala tilda.

**Tekshirildi.** Hostda `node` yo'q — hammasi Docker'da (`postgres:16`, `node:20`,
`local-neon-http-proxy`, `puppeteer`). Bo'sh bazada `migrate deploy` 8/8 toza, `migrate diff`
drift yo'q, 5 GIN indeks bor. `tsc` (api/web/shared/db) toza, vitest **43/43**,
`wrangler --dry-run` va `vite build` toza. **HTTP:** `q=energetika` → 6 natija guruhlangan;
`q=e` va `q=---` → 400; `type=structure` → `/laboratories/:id`; sana oralig'i ikki chetini
qamraydi; noto'g'ri sana → 400; **31-so'rovda 429**; parchada faqat `<mark>`. Admin orqali
yaratilgan yangilik/nashr/xodim **darhol** topildi, `PUT` dan keyin yangi sarlavha bo'yicha ham.
**Brauzerda:** guruhlar/sonlar, filtrlar manzilni o'zgartiradi, bo'sh holat maslahati,
sarlavhada 6 taklif → `↓↓`+`Enter` yangilikka o'tdi, `Escape` yopdi, uchala tilda natija,
375px da overflow 0, konsol xatosi yo'q.

**TEKSHIRILMADI:** production Neon'da migratsiya; haqiqiy `wrangler dev`; ekran o'qigich (10B);
ko'p izolyatli rate limit.

**Qarorlar.** Lug'at `simple` + prefiks (`so'z:*`) — o'zbek lug'ati yo'q, aks holda `energetika`
so'rovi `energetikaning` ni topmasdi; har bir so'z qo'shtirnoqda (`'o''zbek':*`), shuning uchun
apostrof va `&|!` `tsquery` ni buzmaydi. Hisoblar HAMMA bo'lim bo'yicha, natijalar tanlangani
bo'yicha — filtrdagi sonlar sakramasin. `reindex()` xatosi so'rovni yiqitmaydi, jurnalga
`SEARCH_INDEX_FAILED` tushadi. Sana SQL da ISO matnga o'giriladi.

### 2026-08-27 · 09 — Murojaatlar tizimi va elektron xat yuborish

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(contact): appeal tracking with email notifications`

**Baza.** `ContactMessage` ga `ticketNumber` (unikal), `status`, `statusChangedAt`,
`answeredAt`, `answerNote`, `notifiedAt` qo'shildi; `read` olib tashlandi. Migratsiya
`6_contact_appeals` mavjud yozuvlarni ko'chiradi: `read = true` → `in_review`, aks holda `new`;
raqamlar `createdAt` bo'yicha yil kesimida SQL oynali funksiya bilan beriladi.

**Server.** `lib/mail.ts` (Resend HTTP API, hech qachon `throw` qilmaydi),
`lib/mail-templates.ts` (uchta o'zbekcha shablon). `routes/contact.ts` qayta yozildi:
ketma-ket raqam, spam himoyasi, ochiq `GET /status`, admin `PATCH`, `POST /cleanup`.
`Env` ga `RESEND_API_KEY` va `MAIL_FROM` (ikkalasi ham ixtiyoriy) qo'shildi.

**Frontend.** `AppealStatusPage` (raqam + pochta), `ContactPage` ga honeypot, forma ochilgan
vaqt va murojaat raqamini ko'rsatish, `AdminMessagesPage` to'liq qayta yozildi,
boshqaruv panelida javobsiz murojaatlar. `RATE_LIMITED` xato kodi qo'shildi (API va web).

**Nima tekshirildi va qanday:**
- `tsc` (api + web), `npm run build`, `wrangler deploy --dry-run` — toza. Birlik sinovlari
  23/23. i18n uchala faylda 296 tadan, farq yo'q.
- **Kalitsiz holat (curl):** murojaat saqlandi, `M-2026-0001` qaytdi, foydalanuvchi
  muvaffaqiyat ko'rdi, jurnalda `warning` / `MAIL_NOT_CONFIGURED`.
- **Holat tekshiruvi:** to'g'ri juftlik → holat; **begona pochta → 404**; faqat raqam → 400;
  mavjud bo'lmagan raqam → **aynan o'sha 404 xabari** (farq yo'q, oracle bermaydi).
  Javobda murojaat matni yo'q.
- **Spam:** honeypot to'ldirilgan → 201 «muvaffaqiyat», bazaga **yozilmadi**; 1 soniyada
  yuborilgan → xuddi shunday; IP bo'yicha 4-murojaat → **429**; bir xil matn takroran
  yuborilganda **o'sha raqam** qaytdi va yangi yozuv yaratilmadi.
- **Xatlar (soxta Resend serveri bilan, haqiqiy xat YUBORILMADI):** so'rov
  `https://api.resend.com/emails` ga, `from` = `MAIL_FROM`, mavzu `Murojaatingiz qabul qilindi`.
  Uchala shablonda **murojaat matni yo'q, telefon raqami yo'q**, raqam va holat havolasi bor,
  xodim xatida admin havolasi bor, hammasi o'zbekcha.
- **Brauzerda:** forma → raqam `M-2026-0001` ekranda «saqlab qo'ying» izohi bilan;
  `/appeal-status` da to'g'ri juftlik → holat, begona pochta → «topilmadi»; uchala tilda
  sahifa tarjima qilingan, ko'rinib qolgan kalit yo'q; admin ro'yxatida raqam va holat,
  filtr ishladi; `answered` tugmasi **tasdiq so'radi** («Fuqaroga … xati yuboriladi.
  Davom etasizmi?»), bekor qilinganda holat o'zgarmadi; boshqaruv panelida javobsiz
  murojaatlar ko'rsatkichi.
- **Honeypot** DOM tekshiruvi: `left: -9999px`, `tabIndex = -1`, `aria-hidden` ichida —
  foydalanuvchi ko'rmaydi.

**Nima TEKSHIRILMADI:**
- **Haqiqiy xat yetib borishi** — `RESEND_API_KEY` yo'q va topshiriq chegarasi bo'yicha
  haqiqiy fuqarolarga sinov xati yuborilmadi. Kalit o'rnatilgach o'z pochtangiz bilan
  bir marta sinash kerak.
- Saqlash muddati bo'yicha tozalash (`POST /api/contact/cleanup`) haqiqiy muddat bilan.
- Rate limitning bir nechta Workers izolyati orasidagi xatti-harakati.

**Qarorlar va sabablari:**
- **Holat tekshiruvida sabab aytilmaydi.** «Raqam yo'q» va «pochta mos emas» javoblari farq
  qilsa, raqamlar ketma-ket bo'lgani uchun ularni birma-bir sinab ko'rish mumkin bo'lardi.
- **Spam rad etilganda «muvaffaqiyat» ko'rsatiladi** — robot rad etilganini bilmasligi kerak,
  aks holda himoyani aylanib o'tishga urinadi.
- **Honeypot `display: none` emas, ekrandan tashqarida** — ba'zi robotlar `hidden`
  maydonlarni o'tkazib yuboradi.
- **Xatlar murojaat saqlanganidan KEYIN va `waitUntil()` ichida yuboriladi** — xat
  yuborilmagani uchun fuqaroning murojaati yo'qolmasligi kerak.
- **Qabul qiluvchi manzil jurnal MATNIGA yozilmaydi** — `redact` uni niqoblasa ham,
  umuman bo'lmagani xavfsizroq.

**Eslatma:** ikki marta sinov shartimning o'zi noto'g'ri edi (honeypot uchun Playwright
ekrandan tashqaridagi elementni ham «ko'rinadigan» deb hisoblaydi; tasdiq matnida
«xat yuboriladi» o'rniga «xati yuboriladi» bor edi). Ikkalasi ham to'g'ridan-to'g'ri
tekshirib tasdiqlandi, ilovada xato yo'q.

---
