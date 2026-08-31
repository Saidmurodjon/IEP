# Topshiriq 14 — Test ma'lumotlari bilan to'ldirish (lokal baza)

**Ustuvorlik:** 🟠 O'rta
**Bog'liq muammo:** `CLAUDE.md` 8-muammo (bazada faqat demo ma'lumot)
**Maqsad:** saytning HAMMA bo'limi to'la holatda ko'rinsin — bo'sh sahifa qolmasin.

---

## Muammo

Kod tayyor, lekin baza deyarli bo'sh. `/employees`, `/management`, `/publications`,
`/documents` sahifalari "ro'yxat to'ldirilmoqda" holatida turibdi, bosh sahifadagi
hamkorlar lentasi umuman ko'rinmaydi. Shu sababli:

- sahifalash (pagination), kartochka to'ri, rasm o'lchamlari va laboratoriya
  sahifalaridagi xodimlar ro'yxati **hech qachon haqiqiy hajmda sinalmagan**;
- dizayn kamchiliklari (uzun ism satrdan chiqib ketishi, logotip nisbati,
  bo'sh avatar) faqat ma'lumot kelgandan keyin bilinadi;
- qidiruv indeksi bir nechta yozuvda tekshirilgan, o'nlab yozuvda emas.

Institutdan haqiqiy ma'lumot hali kelmagan (`docs/kerakli-malumotlar.md`).
Uni kutib turmasdan, **ataylab soxta ko'rinadigan** test ma'lumoti bilan
to'ldirib, sayt to'la yuk ostida qanday ishlashini ko'rish kerak.

---

## 1. Qattiq qoidalar

Bularni buzmang — bu topshiriqning butun mazmuni shunda.

1. **Faqat lokal baza.** Neon (production) bazasiga bir dona ham test yozuvi
   tushmasin. Skript `demo-content.ts` dagi `assertLocalDatabase()` bilan bir xil
   to'siqqa ega bo'lsin va `DATABASE_URL` lokal bo'lmasa **xato tashlab to'xtasin**.
2. **Ma'lumot birinchi qarashda soxta bo'lsin.** Ishonarli ko'rinadigan soxta
   ism, tashkilot yoki ilmiy natija yozilmaydi. `Xodim 07`, `Hamkor tashkilot 3`,
   `Lorem ipsum dolor sit amet` — o'qigan odam darhol bu test ekanini bilsin.
   Bu 2-qoida emas, birinchi darajali talab: rasmiy davlat muassasasi sayti.
3. **Haqiqiy shaxs, tashkilot va savdo belgisi ishlatilmaydi.** Logotip —
   generatsiya qilingan neytral shakl, birorta tashkilotniki emas. Fotosurat —
   haqiqiy odam surati emas.
4. **Har bir yozuv `test-` prefiksi bilan belgilanadi** (`id` yoki `slug` da),
   toki bitta buyruq bilan izsiz o'chirib tashlash mumkin bo'lsin (7-bo'lim).
5. **Uch til majburiy.** `uz` va `en` — lotin lorem, `ru` — **kirill lorem**
   (`Лорем ипсум долор сит амет`). Til almashtirish sinovi shunda ko'zga tashlanadi.
6. `seed.ts` ga TEGILMAYDI. Tuzilma (17 birlik) rasmiy hujjatdan olingan va
   test ma'lumoti emas — u o'z holicha qoladi.

---

## 2. Muhitni tayyorlash

Lokal baza Docker'da allaqachon ishlab turibdi:

| Konteyner | Port | Vazifasi |
|---|---|---|
| `iep-pg` | `5433:5432` | PostgreSQL 16 — lokal baza |
| `iep-neon-proxy` | `4444:4444` | `local-neon-http-proxy` — Workers'dagi Neon HTTP drayveri lokal Postgres bilan gaplashishi uchun |

Ikkala faylda ham `DATABASE_URL` **lokal** bazaga qaratilsin:

| Fayl | Qiymat |
|---|---|
| `.env` (ildiz) | `postgresql://postgres:postgres@localhost:5433/energetika` |
| `apps/api/.dev.vars` | proksi orqali — `local-neon-http-proxy` hujjatidagi shakl (`localhost:4444`) |

> ⚠️ Hozir `apps/api/.dev.vars` **production Neon'ga qaraydi** (`docs/JOURNAL.md`,
> 2026-08-31). Bu topshiriqni boshlashdan oldin uni albatta lokal bazaga
> o'zgartiring va o'zgartirganingizni tekshiring:
> `curl -s localhost:3000/api/news | head -c 200` — production yangiliklari
> chiqmasligi kerak.

Keyin:

```bash
npm run db:generate
npm run db:migrate      # 1–7 migratsiyalar
npm run db:seed         # tuzilma + sozlamalar (test emas)
npm run dev             # api :3000, web :5173
```

---

## 3. Skript

Yangi fayl: **`packages/db/src/test-content.ts`**.
`package.json` (ildiz) ga skript qo'shilsin:

```json
"db:test": "npm run test-content --workspace=packages/db",
"db:test:clean": "npm run test-content:clean --workspace=packages/db"
```

Skript ikki bosqichda ishlaydi.

### 3.1 Bosqich A — fayllar (API orqali)

Rasm va PDF **to'g'ridan-to'g'ri bazaga yozilmaydi**: ular R2 omboriga
`POST /api/uploads` orqali tushishi kerak, aks holda `MediaFile` yozuvi
bo'lmaydi va tozalash ishlamaydi (`CLAUDE.md` 17-qoida).

1. `POST /api/auth/login` — `.env` dagi `ADMIN_EMAIL` / `ADMIN_PASSWORD` bilan JWT olinadi.
2. Har bir fayl `POST /api/uploads?kind=...` ga yuboriladi
   (`image` — yangilik rasmi, `photo` — xodim surati va logotip, `document` — PDF).
3. Javobdagi `url` (`/api/files/<key>`) `packages/db/.test-media.json` ga yoziladi.
   Bu fayl `.gitignore` ga qo'shilsin.

Cheklovlar (`apps/api/src/lib/file-types.ts`): `image` — 5 MB, `photo` — 2 MB,
`document` — 20 MB. Tur **magic bayt** bo'yicha aniqlanadi, **SVG qabul qilinmaydi**.
Ya'ni logotiplar ham PNG bo'lishi shart.

### 3.2 Bosqich B — yozuvlar (Prisma orqali)

Qolgan hamma narsa `PrismaClient` bilan `upsert` qilinadi, `id` lari qat'iy:
`test-emp-01`, `test-partner-03`, `test-news-07`, `test-pub-11`, `test-doc-04`.
Qayta ishga tushirilganda takror yozuv paydo bo'lmasin.

Oxirida qidiruv vektorlari qayta hisoblansin — Prisma `searchVector` ni
to'ldirmaydi (`CLAUDE.md` 21-qoida):

```ts
for (const table of SEARCH_TABLES) {
  await prisma.$executeRawUnsafe(reindexAllSql(table));
}
```

---

## 4. Anonim rasmlar va fayllar

Tashqi xizmatdan (`placehold.co`, `picsum.photos` va h.k.) rasm **olinmaydi**:
CSP `img-src` faqat `'self'`, `data:` va API manzilini ruxsat etadi, ya'ni
tashqi rasm ochiq saytda umuman ko'rinmaydi.

Rasmlar skript ichida generatsiya qilinsin — `sharp` yoki oddiy PNG yozuvchi
kutubxona bilan. Talablar:

| Fayl turi | O'lcham | Ko'rinishi |
|---|---|---|
| Yangilik rasmi | 1200×675 (16:9) | Bir rangli fon (kulrang gradatsiyalari) + o'rtada yirik `TEST 07` yozuvi |
| Xodim surati | 400×400 kvadrat | Kulrang fon + siluet doira + `07` raqami. **Haqiqiy yuz emas** |
| Hamkor logotipi | 400×200, shaffof fon | Neytral geometrik shakl + `H3` yozuvi. Birorta tashkilot belgisiga o'xshamasin |
| Hujjat | PDF, 1 bet | Sarlavhada `TEST HUJJAT 04`, matnda lorem |

Har bir faylning `originalName` i `test-` bilan boshlansin — tozalash shunga tayanadi.

---

## 5. To'ldiriladigan hajm

| Model | Soni | Tafsilot |
|---|---|---|
| `Employee` | **29** | 4 rahbariyat, 6 laboratoriya mudiri, 11 laboratoriya xodimi, 1 integratsiya-resurs markazi, 7 ma'muriy. Bu tuzilma hujjatidagi shtat soniga to'g'ri keladi (17 + 1 + 7 + 4) |
| `Partner` | **8** | Bosh sahifadagi lenta va aylanishi shu sonda sinaladi |
| `News` | **12** | 10 tasi `isPublished: true`, **2 tasi qoralama** — qoralama ochiq saytda ko'rinmasligi tekshiriladi |
| `Publication` | **15** | 7 `article`, 3 `conference`, 2 `monograph`, 2 `patent`, 1 `report` — filtr shunda sinaladi |
| `Document` | **10** | Turli `category` va `documentDate` bilan |
| `ContactMessage` | **5** | Har biri boshqa `status`: `new`, `in_review`, `answered`, `closed`, `new` |
| `ErrorLog` | 3 (ixtiyoriy) | `/admin/logs` bo'sh ko'rinmasligi uchun |

### Ataylab to'ldirilmaydigan joylar

Bular xato emas — **zaxira holatlarni (fallback) sinash uchun** shunday qoldiriladi:

- **17 xodimda `photoUrl` bo'sh** (12 tasida bor) — `EmployeeCard` ism bosh
  harflaridan avatar yasashi kerak.
- **2 yangilikda `imageUrl` bo'sh** — o'rniga ikonkali blok chiqadi.
- **5 nashrda `fileUrl` bo'sh** — "yuklab olish" tugmasi ko'rinmasligi kerak.
- **Bir nechta xodimda `degree`, `title`, `orcid`, `scopusId` bo'sh.**

---

## 6. Maydonlar bo'yicha aniq qoidalar

Zod sxemalari: `apps/api/src/routes/*.ts`. Prisma orqali yozilganda ham
**o'sha cheklovlarga rioya qiling**, aks holda admin panel orqali tahrirlashda
yozuv saqlanmay qoladi.

| Maydon | Qiymat namunasi | Sabab |
|---|---|---|
| `Employee.fullNameUz/En/Ru` | `Xodim 07` / `Employee 07` / `Сотрудник 07` | Anonim, uch tilda |
| `Employee.positionUz` | `Katta ilmiy xodim` (haqiqiy lavozim nomi — bu shaxsiy ma'lumot emas) | |
| `Employee.email` | `xodim07@example.invalid` | `.invalid` — RFC 2606 bo'yicha hech qachon mavjud bo'lmaydi |
| `Employee.phone` | `+998 00 000-00-07` | Ko'rinib turgan soxta raqam |
| `Employee.orcid` | `0000-0000-0000-0007` | Haqiqiy ORCID emas |
| `Employee.receptionHoursUz` | `Dushanba, 15:00 – 17:00` | Fuqaro uchun eng muhim maydon — bo'sh qolmasin |
| `Employee.unitId` | `seed.ts` dagi id (`lab-smart-grid`, `finance-dept`, ...) | Yangi birlik yaratilmaydi |
| `Employee.isManagement` | 4 ta yozuvda `true` | `/management` sahifasi shu bo'yicha filtrlaydi |
| `Employee.isUnitHead` | 6 ta laboratoriya mudirida `true` | Laboratoriya sahifasida birinchi chiqadi |
| `News.slug` | `test-news-07` | Tozalash uchun prefiks |
| `News.imageUrl` | **TO'LIQ manzil** — `http://localhost:3000/api/files/<key>` | Pastdagi 8-bo'limga qarang |
| `News.sourceName` / `sourceUrl` | 2 ta yangilikda to'ldirilsin | 373-son qaror 4-bandi ko'rsatuvi shunda ko'rinadi |
| `Publication.authors` | `Muallif A., Muallif B.` | Anonim |
| `Publication.doi` | `10.0000/test.0011` | `10.0000` — ro'yxatdan o'tmagan prefiks, hech qachon haqiqiy DOI bo'lmaydi |
| `Publication.year` | 2019–2026 oralig'ida tarqoq | Yil bo'yicha saralash sinaladi |
| `Document.fileKey` | `MediaFile.key` (`YYYY/MM/<uuid>.pdf`) — **to'liq manzil emas** | `DocumentsPage` uni `fileUrl()` bilan o'zi to'liqlashtiradi |
| `Document.documentNumber` | `TEST-04` | |
| `ContactMessage.ticketNumber` | `M-2026-9001` … `M-2026-9005` | 9000 dan boshlanadi — haqiqiy hisoblagich bilan to'qnashmasin |
| `ContactMessage.name` / `email` | `Murojaatchi 1` / `murojaat1@example.invalid` | Bu jadval shaxsiy ma'lumot saqlaydi — soxtaligi aniq bo'lsin |

**Lorem matnlar.** `summary` — 1–2 gap, `content` — 3–4 `<p>` (`sanitize.ts`
ruxsat bergan teglar doirasida: `p`, `ul`, `li`, `strong`, `a`). Bittasida
`<ul>` va bittasida `/api/files/` dan rasm bo'lgan `<img>` bo'lsin — tahrirlagich
va sanitizatsiya shunda sinaladi.

---

## 7. Tozalash

`db:test:clean` quyidagini bajarsin (**faqat lokal bazada**, o'sha to'siq bilan):

```ts
await prisma.employee.deleteMany({ where: { id: { startsWith: 'test-' } } });
await prisma.partner.deleteMany({ where: { id: { startsWith: 'test-' } } });
await prisma.news.deleteMany({ where: { slug: { startsWith: 'test-' } } });
await prisma.publication.deleteMany({ where: { id: { startsWith: 'test-' } } });
await prisma.document.deleteMany({ where: { id: { startsWith: 'test-' } } });
await prisma.contactMessage.deleteMany({ where: { ticketNumber: { startsWith: 'M-2026-9' } } });
await prisma.errorLog.deleteMany({ where: { fingerprint: { startsWith: 'test-' } } });
```

Fayllar: `originalName` `test-` bilan boshlanadigan `MediaFile` yozuvlari
o'chirilsin va **o'sha kalitlar bo'yicha** R2 dan ham o'chirilsin. Ombor bo'ylab
ommaviy o'chirish qilinmaydi (`CLAUDE.md` 17-qoida) — `POST /api/uploads/cleanup`
dagi mavjud mantiqdan foydalaning.

Oxirida qidiruv indeksi qayta hisoblansin, aks holda o'chirilgan yozuvlar
qidiruvda "arvoh" bo'lib qoladi.

---

## 8. Yo'l-yo'lakay topilgan kamchilik

`POST /api/news` sxemasida `imageUrl: z.string().url()` — **to'liq** manzil talab
qilinadi. Ammo `FileUploadField` yuklashdan keyin **nisbiy** manzil qaytaradi
(`/api/files/<key>`) va `AdminNewsPage` uni o'zgartirmasdan yuboradi
(`AdminNewsPage.tsx:225`). Ya'ni **admin panel orqali rasm bilan yangilik
saqlansa 400 xato bo'lishi kerak.**

Buni shu topshiriqda tuzatmang — avval haqiqatan takrorlanishini tasdiqlang
(admin panelda rasm biriktirib saqlab ko'ring), natijani `docs/JOURNAL.md` ga
yozing va alohida topshiriq sifatida taklif qiling. Yechim yo'nalishi:
`Publications` va `Documents` da qilingani kabi `fileUrl()` bilan
to'liqlashtirish (`AdminPublicationsPage.tsx:180`).

Test skripti bazaga **to'liq manzil** yozadi — shuning uchun sayt baribir
to'g'ri ko'rinadi va bu kamchilik uni to'sib qo'ymaydi.

---

## 9. Qabul mezonlari

- [ ] `npm run db:test` xatosiz o'tadi; production `DATABASE_URL` bilan ishga
      tushirilsa **xato tashlab to'xtaydi** (buni ataylab sinab ko'ring).
- [ ] Bosh sahifada hamkorlar lentasi ko'rinadi, 8 ta logotip aylanadi.
- [ ] `/employees` — 29 xodim; rasmsizlarida bosh harfli avatar chiqadi.
- [ ] `/management` — 4 kartochka, har birida qabul kunlari ko'rinadi.
- [ ] Har bir laboratoriya sahifasida xodimlar bor, mudir birinchi turadi.
- [ ] `/news` — 10 ta yangilik (qoralama 2 tasi **ko'rinmaydi**), sahifalash ishlaydi.
- [ ] `/publications` — 15 ta, kategoriya filtri ishlaydi.
- [ ] `/documents` — 10 ta, PDF yuklab olinadi va ochiladi.
- [ ] `/search?q=lorem` — hamma modeldan natija qaytaradi (`reindex` ishlagan).
- [ ] `/admin/messages` — 5 murojaat, har xil holatda; holat o'zgartirish ishlaydi.
- [ ] Til uz → en → ru almashtirilganda **hamma** test matni o'zgaradi
      (ruscha kirill lorem — ko'zga darhol tashlanadi).
- [ ] 375px kenglikda hech bir kartochka, ism yoki logotip joyidan chiqmaydi.
- [ ] `npm run db:test:clean` dan keyin sayt yana bo'sh holatga qaytadi va
      qidiruvda test yozuvlari **qolmaydi**.
- [ ] `npx tsc --noEmit` toza (`packages/db`, `apps/api`, `apps/web`).

---

## 10. Tugatgandan keyin

`docs/JOURNAL.md` ga yozuv qo'shing: qaysi hajmda to'ldirildi, **to'la yuk ostida
qaysi dizayn/mantiq kamchiliklari ko'rindi** (bu topshiriqning asosiy natijasi
shu), 8-bo'limdagi `imageUrl` kamchiligi tasdiqlandimi.

Test ma'lumoti Neon'ga **hech qachon** ko'chirilmaydi. Institutdan haqiqiy
ma'lumot kelganda u admin panel orqali kiritiladi — `docs/kerakli-malumotlar.md`.
