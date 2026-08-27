# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-27
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11, 06, 07, 08 va 09 kommitlari lokal
(`origin/master` = `69b6548`).

### Nima ishlaydi
- **09-murojaatlar tizimi tugadi.** Fuqaro murojaat yuboradi, `M-YYYY-NNNN` raqamini oladi va
  `/appeal-status` da holatni kuzatadi. Institut xodimi admin panelda holatni o'zgartiradi.
- **Xat yuborish** Resend orqali (`lib/mail.ts`): fuqaroga tasdiq, institutga bildirishnoma,
  `answered` holatida fuqaroga xabar. Shablonlar `lib/mail-templates.ts` da, hammasi o'zbekcha.
  **Tasdiq xatida murojaat matni va telefon raqami YO'Q.**
- **`RESEND_API_KEY` yo'q bo'lsa murojaat baribir saqlanadi**, jurnalga `warning` tushadi,
  foydalanuvchi xato ko'rmaydi. `MAIL_FROM` alohida secret — domen ulangach faqat u o'zgaradi.
- **Holat tekshiruvi raqam VA pochta ikkalasini talab qiladi.** Mos kelmasa sabab aytilmaydi
  (raqamlarni birma-bir sinash mumkin bo'lmasligi uchun). Javobda murojaat matni qaytarilmaydi.
- **Spam himoyasi:** ko'rinmas maydon (`left: -9999px`), 3 soniyadan tez yuborish, IP bo'yicha
  soatiga 3 ta, bir xil matn takrorlanganda yangi yozuv yaratilmaydi.
- **Admin:** murojaat raqami, holat filtri, yangi murojaatlar ajratilgan, ichki izoh,
  `answered` ga o'tkazishda tasdiq so'raladi. Boshqaruv panelida javobsiz murojaatlar soni.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig` 5433 +
  miniflare R2). Bazada 3 yangilik, 1 media, 0 murojaat, 0 xato yozuvi.

### Nima hali ishlamaydi / bajarilmagan
- **`RESEND_API_KEY` va `MAIL_FROM` o'rnatilmagan** — haqiqiy xat hali yuborilmadi.
  Resend'da domen (`iep.uz`) tasdiqlanmaguncha o'z domendan xat ketmaydi; sinov bosqichida
  `onboarding@resend.dev` faqat hisob egasining pochtasiga yuboradi.
- **R2 bucket production'da yaratilmagan**, **migratsiyalar 2–6 production'ga qo'llanmagan.**
  Deploy'dan OLDIN ikkalasi ham bajarilishi shart.
- **Murojaatlarni saqlash muddati** `appeals_retention_days` sozlamasida (sukut 365 kun),
  lekin aniq muddat institut **yuriskonsultidan** aniqlashtirilishi kerak. Cron sozlanmagan.
- Throttle va rate limitlar izolyat xotirasida (KV/Durable Object kerak).
- Testlar faqat `redact.ts` ni qamraydi, CI yo'q. `npm audit` 19 ta zaiflik (build vositalari).
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan** (`docs/demo.md`).
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda
  (`docs/kerakli-malumotlar.md`).

### Keyingi qadam
1. 09 ni PM tekshirsin.
2. Navbat bo'yicha 10 (qidiruv, imkoniyatlar, xavfsizlik) — navbatdagi oxirgi topshiriq.
3. Production'ga chiqishdan oldin: R2 bucket, migratsiyalar 2–6, Resend secret'lari.

### Ochiq savollar
- Yopilgan murojaatlarni qancha muddat saqlash kerak? **Yuriskonsult javobi kutilmoqda.**
- Murojaat bildirishnomalari uchun alohida pochta manzili bormi (`appeals_email` sozlamasi)?
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?

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
| 09 | Murojaatlar va Resend | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 10 | Qidiruv, imkoniyatlar, xavfsizlik | ⏳ Navbatda |

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

### 2026-08-26 · 08 — Xatoliklarni qayd etish tizimi

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(observability): error logging with grouping and redaction`

**Baza.** `ErrorLog` modeli, `fingerprint` unikal indeks bilan, migratsiya `5_add_error_logs`.

**Server.** `lib/redact.ts` (maxfiy kalitlar, `Bearer`/JWT, ulanish satri, pochta niqoblash,
so'rov tanasi butunlay tushiriladi), `lib/error-log.ts` (FNV-1a barmoq izi, guruhlash,
throttle + kutayotgan hisoblagich, qator chegarasi, TTL tozalash), `routes/logs.ts`
(ro'yxat/filtr/sahifalash, bitta yozuv, PATCH, DELETE, ochiq `POST /client` rate limit bilan,
`POST /cleanup`). `index.ts` da `app.onError` — jurnalga yozish `waitUntil()` ichida, javob
kutmaydi. Alohida qayd etiladigan hodisalar: login rate limit (`RATE_LIMITED`), yaroqsiz
token (`INVALID_TOKEN`), sozlama yo'qligi (`CONFIG_MISSING`), R2 xatolari.

**Frontend.** `lib/client-logger.ts` (global tutuvchilar, 5 soniyalik to'plam, `sendBeacon`,
seansda 20 ta chegara, o'z endpointini qayd etmaydi), `components/ErrorBoundary.tsx`
(uchta joyda: `main.tsx`, `PublicLayout`, `AdminLayout`), `pages/admin/AdminLogsPage.tsx`
(filtrlar, ochiladigan tafsilot, hal qilingan belgisi, izoh, tozalash), boshqaruv panelida
24 soatlik hal qilinmagan xatolar ko'rsatkichi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api + web), `npm run build`, `wrangler deploy --dry-run` — toza.
  i18n: uchala faylda 263 tadan kalit, farq yo'q.
- **Birlik sinovlari: 23/23 o'tdi** (`redact.test.ts`). Sinovlar yozilgan zahoti **haqiqiy
  xato topdi**: `DATABASE_URL` kaliti maxfiy deb tanilmayotgan edi, chunki kalit nomini
  normallashtirish ikki joyda har xil edi (biri `_` ni olib tashlardi, ikkinchisi yo'q).
- **Guruhlash (curl):** bir xil xato 10 marta → 1 yozuv, `count = 1` (throttle);
  61 soniyadan keyin 11-chi yuborishda `count = 11` — ya'ni bazaga 2 ta yozish amali
  bajarildi, lekin takrorlanishlar yo'qolmadi.
- **Rate limit:** 12 ta so'rovdan 9 tasi 202, qolgani **429**.
- **Maxfiy ma'lumot:** parol, JWT, ulanish satri va foydalanuvchi nomi bilan xato
  yuborildi → jurnalda `SuperMaxfiy123`, `SIGNATURE`, `DbParol`, `neondb_owner`,
  `eyJhbGciOiJIUzI1NiJ9` **yo'q**; pochta `a***@iep.uz` shaklida; to'liq pochta yo'q.
- **Halqa himoyasi:** baza mavjud bo'lmagan holatda 5 ta yiqiladigan so'rov →
  `[error-log] recordError` faqat **1 marta**, stack overflow yo'q, server javob beryapti.
- **Brauzerda:** `window.onerror` va `unhandledrejection` orqali tashlangan xatolar
  `/admin/logs` da ko'rindi; manba filtri ishladi; hal qilingan deb belgilash va izoh
  saqlandi; boshqaruv panelida ko'rsatkich chiqdi.
- **Xato chegarasi:** `/api/news` javobi buzilgan holatda sahifa **oq qolmadi** —
  o'zbekcha xato sahifasi, yangilash tugmasi va hodisa raqami chiqdi, **sarlavha va footer
  joyida qoldi**; ingliz va rus tillarida ham tarjima qilingan; admin paneldagi xato ochiq
  sahifani yiqitmadi.

**Nima TEKSHIRILMADI:**
- Throttle/rate limitning bir nechta Workers izolyati orasidagi xatti-harakati (lokal
  harness bitta jarayon).
- TTL tozalash (30/90 kun) haqiqiy muddat bilan — mantiq o'qib chiqildi, `cleanup`
  endpointi ishga tushirildi va 0 qaytardi.
- 5000 qatorlik chegaradan oshganda eski yozuvlarning o'chirilishi.
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Qarorlar va sabablari:**
- **Throttle + kutayotgan hisoblagich.** Topshiriqda ikkita talab bor edi: "10 marta
  takrorlanganda `count` 10 ga teng" va "bir daqiqada bitta yozish". Ular faqat shu yo'l
  bilan birga bajariladi: takrorlanish xotirada to'planadi va keyingi ruxsat etilgan
  yozishda `count` ga qo'shiladi. Aks holda yo baza urib ketardi, yo hisob yo'qolardi.
- **Barmoq izida raqamlar va identifikatorlar `#` ga almashtiriladi** — aks holda
  `id=abc` va `id=xyz` alohida yozuvlarga bo'linib ketardi.
- **Xato chegarasi layout ICHIDA.** Avval marshrut darajasida edi va xato chiqqanda
  sarlavha ham yo'qolardi; endi faqat sahifa qismi almashadi, foydalanuvchi boshqa
  bo'limga o'ta oladi.
- **`sendBeacon` faqat sahifa yopilayotganda** — oddiy holatda `fetch` ishlatiladi,
  chunki `sendBeacon` javobni ko'rsatmaydi va rate limit natijasini bilib bo'lmaydi.

---

---

Eski yozuvlar: `docs/journal-archive/2026-08.md`
