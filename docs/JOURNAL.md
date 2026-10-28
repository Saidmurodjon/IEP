# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-10-28

**🆕 Desktop navbar: mega-panel o'rniga har bir guruh o'z tugmasi tagida ochiladigan ixcham dropdown — LOKALDA tayyor, production'ga CHIQARILMAGAN.**
iep.uz uchun: faqat web deploy, foydalanuvchi tasdig'i bilan.

**🆕 Vakansiyalar (`/vacancies` + admin «Vakansiyalar») LOKALDA tayyor, production'ga CHIQARILMAGAN.**
Migratsiya `11_vacancies` (faqat lokal bazaga). Ariza saytda qabul qilinmaydi — pochta/telefon orqali.
iep.uz uchun: migratsiya 11 + API + web deploy, foydalanuvchi tasdig'i bilan.

**🆕 Bosh sahifa va footer mobil joylashuvi (raqam kartochkalari, ixcham oraliqlar, 2 ustunli havolalar) LOKALDA tayyor, production'ga CHIQARILMAGAN.**

**🆕 «Institut haqida» = qisqa tavsif + rich text; «Sozlamalar» sahifasi olib tashlandi — LOKALDA tayyor,
production'ga CHIQARILMAGAN.** Raqamlar (lab/xodim/ilmiy xodim/nashr) bazadan avtomatik, bosh sahifa
ham `GET /api/about` dan. ⚠️ Lokal bazada lorem ipsum matn + 3 ta public-domain rasm — haqiqiy matnni institut beradi.
iep.uz uchun: API + web deploy (migratsiya kerak emas), foydalanuvchi tasdig'i bilan.

**🆕 Admin navbar: qidiruv maydoni + davr filtri ikonkasi (dashboard grafiklariga ham) LOKALDA tayyor, production'ga CHIQARILMAGAN.**
`GET /api/stats?from&to` (62 kungacha kunlik, aks holda oylik), `GET /api/stats/search?q`.
iep.uz uchun: API + web deploy (migratsiya kerak emas), foydalanuvchi tasdig'i bilan.

**🆕 Hamkorlar kartochkasi (responsiv) LOKALDA tayyor, production'ga CHIQARILMAGAN.** Lokal bazaga
namuna: Fanlar akademiyasi. iep.uz uchun: web deploy + admin orqali haqiqiy hamkorlarni kiritish.

**🆕 Laboratoriyalar — to'liq admin boshqaruvi LOKALDA tayyor, production'ga CHIQARILMAGAN.**
Migratsiya `10_lab_details` (structure_units: content/directions ×3, imageUrl, email, phone, room,
foundedYear). Admin: `/admin/labs` kartochkalar (to'liqlik ko'rsatkichi), `/admin/labs/:id` ichida
«Ma'lumotlar» va «Xodimlar» tablari — xodim lab ichida qo'shiladi/tahrirlanadi (`EmployeeForm`).
Ochiq `/laboratories` va lab sahifasi faqat shu ma'lumotlardan; `staffCount` o'rniga haqiqiy xodim soni.
iep.uz uchun: migratsiya 10 + API + web, foydalanuvchi tasdig'i bilan.

**🆕 Asosiy bo'limlar + xodimning laboratoriyasi — LOKALDA tayyor, production'ga CHIQARILMAGAN.**
Bo'linma turi `section` (asosiy bo'lim) va `laboratory` — ikkalasi ham yuqori darajada, lab bo'lim
ichida emas. Xodim: `unitId` = bo'lim, yangi `labId` = laboratoriya (migratsiya `9_employee_lab`).
Admin: yon panelda alohida «Bo'limlar» (`/admin/sections`) va «Laboratoriyalar» (`/admin/labs`) sahifalari
(`/admin/units` → sections ga yo'naltiriladi); «Tur» va «Rahbar» maydonlari yo'q; lab qatorida xodimlar paneli (biriktirish/chiqarish, «Yangi xodim» → lab tanlangan forma).
Lokal bazada eski bo'linmalar o'chirildi, 6 lab saqlandi, 2 bo'lim yaratildi (Ma'muriy boshqaruv,
Ilmiy xodimlar). iep.uz uchun: migratsiya 9 + bo'linmalarni qayta tuzish SQL (yozuvdagi) + deploy,
foydalanuvchi tasdig'i bilan.

**🆕 18-A + 18-B — admin rollari va dashboard grafiklari LOKALDA tayyor, production'ga CHIQARILMAGAN.**
18-B: `GET /api/stats` + dashboard'da KPI kartochkalar va 5 ta grafik (recharts 2.15.4).
⚠️ Lokal bazada 15 ta nashr 18-B davomida noma'lum sabab bilan o'chib ketdi — foydalanuvchidan so'raldi.
Migratsiya `8_admin_roles` faqat lokal bazaga (5433) qo'llangan. iep.uz ga chiqarish: migratsiya +
API + web, foydalanuvchi tasdig'i bilan.

**🆕 19-C — admin panel: yuqori navbar, til (uz/en/ru), qorong'i mavzu, profil sahifasi LOKALDA tayyor,
production'ga CHIQARILMAGAN.** Admin matnlari to'liq i18n'da. Login sahifasi ham yangilandi (navbar, til/mavzu menyusi, parolni ko'rsatish). Admin qo'shish/tahrirlash
shakllari oyna emas, ro'yxat o'rnida to'liq sahifa (`AdminFormPage`, sticky «Saqlash» paneli); yangilik slug'i faqat
sarlavhadan avtomatik. Xodim formasi ixcham ikki ustunli; ochiq saytda xodim surati 3x4 sm, kartochka mobil uchun qayta dizayn qilingan. Keyingi: D (kiritish qulayligi).

**🆕 17 — tasdiqlangan tuzilma sxemasi (rasm) LOKALDA tayyor, production'ga CHIQARILMAGAN.**
`/structure` da FAQAT rasm (bo'linmalar daraxti olib tashlandi). Admin: «Tuzilma» — rasm,
yangi «Bo'linmalar» (`/admin/units`) — bo'linma/laboratoriya tahriri (laboratoriyalar,
«Institut haqida», xodimlar shunga bog'liq). Production
deploy foydalanuvchi tasdig'ini kutmoqda.

**🧹 Production'dagi test ma'lumotlari o'chirildi (2026-10-27)** — yozuvlar va 45 ta fayl
(fayllar `cleanup` ni foydalanuvchi ishga tushirdi). Admin parolini almashtirish tavsiya etilgan.

**✅ 16 — `https://iep.uz` PRODUCTION'da ishlaydi (2026-10-27).**
Hosting: webname, hisob `iepuz@web2.webspace.uz` (IP 95.46.96.12), SSH kaliti
`~/.ssh/iep_prod`. Domen Arsenal-D'da, NS `dns1–4.webspace.uz` (tarqaldi). SSL: Let's Encrypt
`*.iep.uz` + `iep.uz` (panel avtomatik, 25.01.2027 gacha, avto-yangilanadi). Baza
`iepuz_mainv1` — NOLDAN: 7 migratsiya + seed; eski ma'lumot ko'chirilMADI (foydalanuvchi qarori).
**Qolgan:** Force SSL (http hali 200, redirect yo'q); admin login'ni foydalanuvchi tekshirsin;
`RESEND_API_KEY`/`MAIL_FROM`; baza zaxirasi (cron). Qo'llanma: `docs/deploy-hosting.md`.

**Branch:** `master` · **Push qilinganmi:** ✅ ha — hammasi `origin/master` ga yuborilgan
(`e177810..3a013da`), shu jumladan 13-navbar Bosqich C/D, test-rejim banneri va qidiruv/
maxsus imkoniyatlar ikonka tuzatishlari (batafsil pastdagi 13-yozuv va undan keyingi
yozuvlar).

**⚠️ `apps/api/.dev.vars` foydalanuvchi tasdig'i bilan production Neon bazasiga qaraydi**
(2026-08-31) — lokal `wrangler dev` va testlar endi HAQIQIY production ma'lumotiga
o'qiydi/yozadi. Migratsiya/seed ehtiyotkorlik bilan bajarilsin.

**⏸️ PRODUCTION MIGRATSIYASI TO'XTATILGAN (yarim yo'lda, foydalanuvchi so'rovi bilan).**
Production Neon sxemasi faqat `0_init` darajasida ekani aniqlandi (`_prisma_migrations`da
bitta yozuv, boshqa nom bilan: `20260423052242_init`). Bajarildi: `prisma migrate resolve
--applied 0_init` — bazaviy nuqta to'g'ri belgilandi (SQL qayta ishga tushirilmadi, faqat
`_prisma_migrations`ga yozuv qo'shildi — bu XAVFSIZ va allaqachon production'da amalga
oshgan). **BAJARILMAGAN:** `prisma migrate deploy` (1–7 migratsiyalarni qo'llash) — Claude
Code'ning auto-mode klassifikatori production DB ustidagi sxema o'zgarishini bloklaydi,
buni faqat foydalanuvchi o'zi (`!` prefiksi bilan) yoki Bash ruxsat qoidasi qo'shilgandan
keyin bajarish mumkin. Barcha 7 migratsiya xavfsizlik uchun oldindan tekshirilgan (faqat
`ADD COLUMN`/`CREATE TABLE`, 6-migratsiya `read` ustunini backfill'dan keyin o'chiradi —
ma'lumot yo'qolmaydi). Buyruq va Neon URL foydalanuvchiga alohida xabarda berilgan.
**14-topshiriq (test ma'lumotlari, LOKAL bazada) endi BAJARILDI** — batafsil pastdagi
14-yozuvda. Shu ish uchun `apps/api/.dev.vars` vaqtincha LOKAL bazaga qaytarilgan edi
(yuqoridagi production-ogohlantirish shu sababli hozircha amal qilmaydi — foydalanuvchi
production'ga qaytishni xohlasa, qayta almashtirish kerak).

### Nima ishlaydi
- **09, 10A va 10B PM tomonidan QABUL QILINDI.**
- **10C — xavfsizlik sarlavhalari tayyor.** Frontend: `apps/web/public/_headers`
  (Cloudflare Pages) — HSTS (1 yil), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (kamera/mikrofon/joylashuv o'chirilgan). API:
  `apps/api/src/index.ts` ga xuddi shu uchtasini qo'shadigan oraliq qatlam —
  `finally` bilan, xatoli javobda ham ishlaydi.
- **CSP — FAQAT `Content-Security-Policy-Report-Only`.** `script-src`/`style-src` da
  `unsafe-inline`/`unsafe-eval` yo'q (build inline skript yozmaydi — tekshirildi).
  `connect-src` ga production API manzili qo'shildi, `style-src`/`font-src` ga
  Google Fonts, `img-src` ga `self`+`data:`. Haqiqiy rejimga **hali o'tkazilmagan** —
  bir necha kun konsolda kuzatilishi kerak.
- **`FRONTEND_URL` bo'sh bo'lsa API fail closed** (`lib/env.ts`, `getFrontendUrl()`).
  CORS endi shu qiymatdan olinadi, `localhost:5173` ga jimgina tushib qolish yo'q.
- **404 sahifasidagi qidiruv maydoni endi ishlaydi** — `/search?q=` ga yo'naltiradi
  (avvalgi `disabled` holat olib tashlandi, `search_soon` kaliti o'chirildi).
- **Admin panelga ham `main#main-content` va skip-link qo'shildi** (`AdminLayout`).
- **Header'dagi fokus xatosi tuzatildi:** `AccessibilityPanel`ga uzatilgan `onClose`
  endi `useCallback` bilan barqaror — sozlama panelda o'zgartirilganda fokus endi
  bosilgan tugmada qoladi, panelning boshiga sakramaydi.
- **Fayl havolalari to'g'irlandi** (`fix(files)`) — `fileUrl()`/`isOwnFileUrl()`
  (`lib/api.ts`), Documents/Publications endi to'liq manzil bilan ishlaydi.
- **Ikki darajali mega-menyu (desktop)** — batafsil pastdagi 13-yozuvda.
- **Aloqa ma'lumotlari (manzil/telefon/pochta/ish vaqti) endi STATIK**
  (`apps/web/src/config/contact.ts`) — bazadan olinmaydi. Sabab: bu ma'lumot
  amalda o'zgarmaydi, har sahifada `/api/settings` so'rovi keraksiz edi.
  `AdminSettingsPage`dan o'lik maydonlar (manzil, telefon, ish vaqti) olib
  tashlandi. `email` sozlamasi DB da QOLDI — u endi ko'rsatiladigan aloqa
  emaili emas, murojaat bildirishnomalari uchun zaxira manzil
  (`appeals_email` bo'sh bo'lsa ishlatiladi); qiymati `energy@academy.uz`
  ga moslashtirildi (statik konfiguratsiya bilan bir xil bo'lishi uchun,
  production Neon'da ham yangilandi).

### Nima hali ishlamaydi / bajarilmagan
- **13-navbar TO'LIQ BAJARILDI va PUSH QILINDI** (Bosqich A/B/C/D + qidiruv/maxsus imkoniyatlar
  ikonka tuzatishlari — batafsil pastdagi yozuvlar). PM tekshiruvini kutmoqda.
- **CSP hali Report-Only** — production'da bir necha kun kuzatilib, keyin haqiqiy
  rejimga (`Content-Security-Policy`) o'tkazilishi kerak.
- **Admin panelda YANGI axe-core topilmalari bor** (10C tekshiruvida aniqlandi,
  TUZATILMAGAN — jurnalga yozildi, 10-topshiriq doirasidan tashqarida):
  `/admin/news` — 6 ta ikonka tugmada nom yo'q (`button-name`) + sana ustunida
  kontrast; `/admin/employees` — bo'sh holat matni kontrasti; `/admin/messages` va
  `/admin/logs` — filtr `<select>` larida nom yo'q (`select-name`), sana maydonida
  `label` yo'q; dashboard'da sana kontrasti. Bular 373-son qaror doirasiga
  kirmaydi (admin — ichki xodim vositasi), lekin qulaylik uchun alohida
  topshiriq sifatida qilinishi tavsiya etiladi.
- **Hostda `node`/`npm` PATH da yo'q.** Butun tekshiruv Docker orqali: `postgres:16`
  (5433), `node:20`, `local-neon-http-proxy`, `puppeteer` + `axe-core`,
  `wrangler pages dev` (CSP/sarlavha tekshiruvi uchun).
- `apps/web` da birlik sinovlari yo'q (vitest faqat `apps/api` da).
- **`RESEND_API_KEY` va `MAIL_FROM` o'rnatilmagan**, **R2 bucket production'da yo'q**,
  **migratsiyalar 2–7 production'ga qo'llanmagan.**
- Murojaatlarni saqlash muddati yuriskonsultdan kutilmoqda. Cron sozlanmagan.
- Throttle va rate limitlar izolyat xotirasida (KV/Durable Object kerak).
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda.

### Keyingi qadam
1. **14-topshiriq TAYYOR (lokal baza, TO'LIQ hajm)** — batafsil yuqoridagi 14-yozuvda.
   Foydalanuvchi o'z `npm run dev`ida `npm run db:test` ishga tushirsin (lokal baza
   hozir bo'sh — sabab yuqoridagi yozuvda).
2. Production migratsiyasini yakunlash (`prisma migrate deploy`, 1–7) — foydalanuvchi
   ruxsati bilan to'xtatilgan, yuqoriga qarang.
3. 10C va 13-navbar'ni PM tekshirsin.
4. Yangi topshiriq takliflari (14-yozuvda aniqlangan): (a) `apps/api/src/lib/*.ts`da
   Prisma `updateMany`/`upsert` ishlatilgan joylar `PrismaNeonHTTP` bilan mos
   kelishini tekshirish (HTTP rejimida ikkalasi ham "Transactions are not supported"
   bilan yiqiladi); (b) `AdminNewsPage`da `imageUrl` uchun `fileUrl()` o'ramini
   qo'shish (`AdminPublicationsPage`dagi kabi) — `.url()` validatsiyasi nisbiy
   manzilni rad etadi; (c) admin panel accessibility (yuqoridagi axe topilmalari).
5. Production'ga chiqishdan oldin: CSP'ni bir necha kun Report-Only rejimida
   kuzatish, keyin haqiqiy rejimga o'tkazish; R2 bucket; Resend secret'lari;
   `wrangler deploy` va Cloudflare Pages qayta deploy (hozirgi live sayt ESKI
   kodni ishlatadi — `/api/employees` 404 qaytaradi).

### Ochiq savollar
- Yopilgan murojaatlarni qancha muddat saqlash kerak? **Yuriskonsult javobi kutilmoqda.**
- Murojaat bildirishnomalari uchun alohida pochta manzili bormi (`appeals_email`)?
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?
- `apps/web` uchun vitest qo'shilsinmi (a11y va sanitizatsiya funksiyalari uchun)?
- Admin panel accessibility alohida topshiriq sifatida navbatga qo'shilsinmi?

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
| 10A | Sayt bo'ylab qidiruv | ✅ **Qabul qilindi** |
| 10B | Imkoniyati cheklanganlar uchun qulayliklar | ✅ **Qabul qilindi** |
| 10C | Xavfsizlik sarlavhalari va CSP | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 13 | Ikki darajali mega-menyu | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 14 | Test ma'lumotlari (lokal baza) | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 15 | Xodim rasmi 3x4, admin ommaviy amal, modal fokus xatosi | 🟠 Bajarildi, brauzerda tekshirilmadi (PM tekshiruvi kutilmoqda) |

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

**Ish tartibi (2026-10-27 dan, foydalanuvchi qarori):**
- **Nazoratchi — Opus.** Topshiriqni bo'ladi, fayllarni sessiyalarga taqsimlaydi, natijani
  tekshiradi (`tsc`, test, build, brauzer), kommit va push qiladi, jurnalni yuritadi.
- **Koder — Sonnet subagentlar.** Har biriga aniq fayllar ro'yxati beriladi; ikki koder bitta
  faylga tegmaydi. Koder kommit/push/deploy QILMAYDI, faqat o'zgartiradi va hisobot beradi.
- **Token tejash:** koderga butun kontekst emas, faqat kerakli fayllar va qabul mezoni beriladi;
  hisobot 5–10 qator.
- **Lokal muhit doim ishlab turadi:** API `wrangler dev --port 8787` (3000 ni open-webui
  egallagan), web `VITE_API_URL=http://localhost:8787 vite` → http://localhost:5173.
  Baza — lokal (`localhost:4444` neon-proxy → `iep-pg`).
- **GitHub:** har bir tekshirilgan o'zgarish kommit qilinib `origin/master` ga push qilinadi
  (foydalanuvchi ruxsat berdi).
- **Production (iep.uz):** FAQAT foydalanuvchi aniq tasdiqlagandan keyin.

---

## YOZUVLAR

### 2026-10-28 — demo rahbariyat: direktor + ilmiy ishlar bo'yicha o'rinbosar (faqat lokal baza)
- Foydalanuvchi so'rovi: «Rahbariyat» sahifasiga lorem ma'lumotli, rasmli 2 rahbar. Kod o'zgarmadi.
- Lokal API (8787) orqali admin bilan: 2 portret `POST /api/uploads?kind=image` (Unsplash litsenziyasi,
  600×800, `ownerType=employee` + `ownerId`), keyin `POST /api/employees` — `isManagement`, bo'lim
  `section-management`, order −2/−1 (mavjud xodimdan oldin), uch tilda lavozim/daraja/unvon/yo'nalish/qabul vaqti.
- Birinchi yuklashda `ownerId` berilmagan 2 fayl yetim qoldi — `POST /api/uploads/cleanup` keyin o'chiradi.
- Tekshirildi: `GET /api/employees` tartibi, `/api/files/...` 200 image/jpeg. Tekshirilmadi: sahifaning brauzerdagi ko'rinishi.
- Production'ga QO'SHILMAGAN — haqiqiy rahbarlar ma'lumoti va rasmini institut beradi.

### 2026-10-28 — admin «Hamkorlar»: ogohlantirish bloki olib tashlandi

- Foydalanuvchi so'rovi: «Diqqat. Hamkor tashkilot logotipi … savdo belgisi …» sariq bloki
  `AdminPartnersPage.tsx` dan o'chirildi.
- Endi ishlatilmaydigan i18n kalitlari uchala tilda o'chirildi: `adminC.partners.warn_1/2/3/file`,
  `adminC.common.attention` (boshqa joyda ishlatilmasligi grep bilan tasdiqlandi).
- `public/images/partners/README.md` tegilmadi (u admin panelda ko'rinmaydi).
- Tekshirildi: uchala JSON parse bo'ladi, `apps/web` da `tsc --noEmit` toza.
- Tekshirilmadi: sahifa brauzerda ochib ko'rilmadi (faqat blok o'chirildi).

### 2026-10-28 — navbar: dropdown o'z tugmasi tagida
- Muammo: guruh bosilganda butun kenglikdagi mega-panel ochilardi, guruhlarda esa 1–6 ta havola — ko'z tugmadan uzoqqa ketardi.
- `DesktopNav.tsx`: har bir `NavPanel` o'z `NavGroupButton` i bilan bitta `relative` o'ramga ko'chirildi.
  Kechikishlar, focusout, tashqariga bosish, Escape, ↑/↓ mantiqi o'zgarmadi.
- `NavPanel.tsx`: `absolute left-0 top-full`, min 240px, bir ustunli `ul`, faol havola `bg-primary-50`.
  `pt-2` — tugma va panel orasidagi ko'rinmas ko'prik (hover uzilmasin). Header kommentlari yangilandi.
- Tekshirildi: `tsc --noEmit` (web) toza; brauzerda 1728px — 4 ta guruh paneli tugmaning chap cheti bilan aynan bir
  joyda (left farqi 0), button.bottom+8px; ArrowDown→birinchi havola, yana ArrowDown→ikkinchi, Escape→fokus tugmaga, yopiladi.
- Tekshirilmadi: haqiqiy sichqoncha bilan tugmadan panelga o'tish (faqat JS click); mobil menyu tegilmagan.
- Eslatma: JOURNAL.md 250 qatordan oshgan (~500) — arxivlash kerak, bu sessiyada qilinmadi.

### 2026-10-28 — demo yangilik (faqat lokal baza)
- Foydalanuvchi so'rovi: to'liq formatli namuna yangilik, lorem matn + haqiqiy rasmlar. Kod o'zgarmadi.
- Lokal API (8787) orqali admin bilan: 3 rasm `POST /api/uploads?kind=image` (Wikimedia Commons, 1280px:
  quyosh PES — PD, shamol fermasi — PD, podstansiya — CC BY-SA 4.0, mualliflik figcaption'da), keyin `POST /api/news`.
- Slug `quyosh-va-shamol-energetikasi-boyicha-xalqaro-seminar`; uch tilda sarlavha/tavsif, matnda h2/h3, ul/ol,
  blockquote, 2 ta figure+figcaption, ichki havola. Manba maydoni: Wikimedia Commons.
- Tekshirildi: `GET /api/news/:slug` — sanitizatsiyadan keyin barcha teglar va 2 ta `img src` saqlangan; 3 fayl 200 image/jpeg.
- Tekshirilmadi: sahifaning brauzerdagi ko'rinishi (skrinshot olinmadi). Production'ga QO'SHILMAGAN.

### 2026-10-28 — vakansiyalar sahifasi (ochiq + admin)
- Foydalanuvchi qarori: admin boshqaradi, ariza pochta/telefon orqali (saytda fayl yuklash yo'q — shaxsiy ma'lumot xavfi).
- DB: `Vacancy` (uz/en/ru sarlavha+tavsif, `unitId`→bo'linma SetNull, ish turi full/part/contract,
  maosh dan/gacha, muddat, aloqa pochta/telefon, tartib, faol). Migratsiya `11_vacancies` qo'lda yozildi,
  `migrate deploy` bilan lokal 5433 ga qo'llandi.
- API `routes/vacancies.ts`: `GET /` ochiq (faol + muddati o'tmagan), `GET /admin` va CRUD — `requireAuth`.
  Tavsif server tomonda tozalanadi, tavsifdagi rasmlar `syncContentFiles(..., 'vacancy', ...)` bilan biriktiriladi.
  HTTP drayverda tranzaksiya yo'q — `create/update` + `include` 500 berdi, shuning uchun yozib, keyin alohida o'qiladi.
- Web: `VacanciesPage` (kartochka, tavsif ochiladi, «Qanday ariza berish» — vakansiya pochtasi yoki `config/contact.ts`),
  `AdminVacanciesPage` (til tablari, RichTextEditor, muddati o'tgan belgisi), menyuda `institute-vacancies` ochildi,
  uchala locale yangilandi. CLAUDE.md ochiq endpointlar ro'yxatiga `GET /api/vacancies` qo'shildi.
- Tekshirildi: `tsc` (api, web) toza; 68/68 test; `wrangler deploy --dry-run` OK. curl: 401 tokensiz, yaratish/tahrir,
  `<script>` olib tashlanadi, muddati o'tgan va nofaol yashirinadi, salaryFrom>salaryTo rad etiladi, 404, bo'linma include,
  bugungi muddat ko'rinadi. Brauzer: `/uz/vacancies` kartochka bilan, admin ro'yxat, tahrir formasi (editor yuklanadi), saqlash ishladi.
- Tekshirilmadi: `prisma migrate diff`; en/ru sahifa ko'rinishi; editor orqali rasm yuklash; mobil kenglik.
- Lokal bazada bitta namuna vakansiya qoldi («Kichik ilmiy xodim»). Lokal `error_logs` da bitta 500 yozuvi (tranzaksiya xatosi, tuzatilgan).
- Vakansiyalar qidiruvga (`search-index`) qo'shilmadi — kerak bo'lsa alohida ish.

### 2026-10-28 — bosh sahifa: raqamlar bloki desktopda ham ixcham
- Foydalanuvchi so'rovi: desktopda kartochkalar baland edi. Endi barcha kengliklarda ikonka chapda,
  raqam + yorliq yonida; bo'lim oralig'i `py-6 sm:py-8`.
- Tekshirildi: `tsc` toza; Playwright 1280 va 360 px skrinshot — kartochkalar bir qatorda, tekis.

### 2026-10-28 — footer mobil/planshetga moslashtirildi
- `Footer.tsx`: «Sahifalar» ro'yxati mobil va planshetda 2 ustun (lg da 1 ustun); planshetda logo
  bloki to'liq qatorda, «Sahifalar» va «Aloqa» yonma-yon; pastki qator mobilda chapga tekislandi
  (oldin © chapda, «Admin» markazda edi); ichki oraliq `py-10 sm:py-12`.
- Tekshirildi: `tsc` toza; Playwright bilan 360/768/1280 px footer skrinshoti — skroll yo'q,
  desktop ko'rinishi oldingiday.

### 2026-10-28 — bosh sahifa: raqam kartochkalari yana yonma-yon
- Foydalanuvchi so'rovi: mobilda ikonka raqam yonida (chapda) tursin — ustma-ust variant qaytarildi.
- Tekshirildi: `tsc` toza; 360/412 px skrinshot — gorizontal skroll yo'q, 360 da uzun yorliq 2 qatorga o'tadi.

### 2026-10-28 — bosh sahifa: mobil joylashuv tartibga keltirildi
- Muammo (foydalanuvchi skrinshoti): mobilda raqamlar bloki tarqoq (katta bo'shliq, `gap-8`),
  bo'limlar orasida ortiqcha `py-16`, hero matni katta.
- `HomePage.tsx`: raqamlar oq kartochkalarga (mobil — ikonka tepada, sm — chapda, lg — markazda);
  hero sarlavha/tavsif mobilda kichikroq, tugmalar mobilda 2 ustunli teng grid; bo'limlar `py-10 sm:py-16`.
- Tekshirildi: `tsc --noEmit` (web) toza; Playwright (tizim Chrome) bilan 360 va 412 px kenglikda
  skrinshot — gorizontal skroll yo'q (`scrollWidth` = kenglik), kartochkalar tekis.
- Tekshirilmadi: haqiqiy telefonda; desktop ko'rinishi faqat klasslar bo'yicha (lg uslubi oldingiday markazda).
- Eslatma: skrinshotdagi o'ngdagi tarjima/«G»/miya tugmalari — brauzer kengaytmalari, saytniki emas.
- Eslatma: jurnal 250 qatordan oshgan — arxivlash kerak (alohida ish).

### 2026-10-28 — lokal baza: «Institut haqida» lorem + rasmlar (kod o'zgarmadi)
- Foydalanuvchi so'rovi: dizaynni ko'rish uchun lorem matn va haqiqiy rasmlar.
- `POST /api/uploads` orqali 3 rasm (ownerType=about): `about-wind.jpg`, `hero-solar.jpg`
  (loyihadagi, PD) va Commons «Solar panels on a roof» (PD, Pujanak). `PUT /api/about` —
  uchala tilda lorem (h2, ro'yxat, iqtibos, 3 rasm), sarlavhalar tilga mos.
- Tekshirildi: API javobida 3 `<img>` sanitizatsiyadan o'tdi; brauzerda rasmlar yuklandi.
- Faqat lokal baza; production'ga hech narsa yozilmadi.

### 2026-10-28 — fix(web): «Institut haqida» yuklanishda eski matn chaqnashi + yangi dizayn
- Muammo: refresh'da bir lahza i18n'dagi statik matn (`about.mission_text` va h.k.,
  `common.academy`) ko'rinardi — `GET /api/about` kelguncha zaxira matn chizilardi.
- Tuzatish: `isLoading` paytida skeleton (hero, raqamlar, matn); zaxira matn faqat
  javob kelib, kontent bo'sh bo'lsa (yoki API xatosi) ko'rsatiladi.
- Dizayn: hero LabsPage uslubida (gradient + fon ikonka), raqamlar heroga chiqib turgan
  kartochkalar, matn oq kartochkada (h2 chap chiziq bilan), lab ro'yxati sarlavhali panel +
  «Barchasini ko'rish» → `/laboratories`. Yangi i18n kaliti yo'q.
- Tekshirildi: `tsc --noEmit` (web) toza; brauzerda refresh — avval skeleton, keyin
  ma'lumot, eski matn ko'rinmadi (skrinshot).
- Tekshirilmadi: mobil kenglik vizual, en/ru tillari.
- Eslatma: jurnal 250 qatordan oshgan — arxivlash keyingi sessiyaga.

### 2026-10-28 — refactor: sozlamalar statik, «Institut haqida» rich text, raqamlar avtomatik
- Foydalanuvchi: sozlamalar kerak emas (statik yetadi), about «bachkana» — asosiysini qoldirib
  rich text qilish, bosh sahifa ham shundan olsin, raqamlar qo'lda kiritilmasin.
- Sozlamalar: `AdminSettingsPage`, marshrut, menyu, `/api/settings/private`, i18n o'chirildi.
  Pochta/muddat → `api/lib/site-config.ts`; xatlardagi havola → `FRONTEND_URL`; canonical →
  `web/config/site.ts` (`https://iep.uz`). Seed endi `site_settings` yozmaydi.
- About: `{summary, content}` (content HTML, `sanitizeHtml` + `syncContentFiles('about','page')`).
  Oldingi sanalar/qadriyatlar/animatsiyalar olib tashlandi; ochiq sahifa: sarlavha+tavsif,
  raqamlar qatori, matn, yon tomonda laboratoriyalar. `INSTITUTE_STAFF` o'chirildi.
- Ilmiy xodim = faol xodim + `degreeUz` to'ldirilgan (qaror: alohida maydon qo'shilmadi).
- Tahrirlagich boshlang'ich qiymatni faqat yaratilishida oladi → forma to'ldirilgach chiziladi.
- **Tekshirildi:** tsc (web/api/db), 68 vitest, dry-run; curl: PUT 200 (`<script>` va tashqi
  `img` kesildi), tokensiz 401, `/settings/private` 404, murojaat 201 (xodim xati statik pochtaga,
  lokal MAIL_NOT_CONFIGURED); brauzer: about (1 h1, siljish yo'q), bosh sahifa tavsif+raqamlar,
  admin'da rich text'ga yozib saqlash → API'da ko'rindi.
- **Tekshirilmadi:** rich text'ga rasm yuklash (lokal R2 yo'q), mobil ko'rinish, en/ru ko'zda.
- Lokal bazada test murojaati `M-2026-9007` qoldi (o'chirish so'ralmagan).

### 2026-10-28 — feat: «Institut haqida» admin orqali boshqariladi, sozlamalar tozalandi
- Sozlamalar: `site_name_*` hech qayerda ishlatilmasdi (nom i18n'dan) — olib tashlandi; `email` va
  `appeals_email` bitta «Bildirishnoma pochtasi»ga birlashtirildi (API'da `email` zaxira bo'lib qoldi).
  Qoldi: pochta, saqlash muddati, `site_url` — izoh bilan, xabar `useToast`.
- **Xavfsizlik:** ochiq `GET /api/settings` murojaat pochtasini hammaga berardi → `PRIVATE_KEYS`
  filtri, admin uchun `GET /api/settings/private` (SUPER_ADMIN). `about_page` ni settings orqali
  yozish taqiqlangan (400).
- `/api/about`: shior, tanishtiruv, yil, missiya/istiqbol, tarix, sanalar (≤40), qadriyatlar (≤8,
  ikonka enum), ilmiy/jami xodim. Hammasi ODDIY MATN (HTML yo'q → sanitizatsiya kerak emas).
  PUT — `requireAuth` (oddiy ADMIN ham, chunki kontent). Lab/nashr soni jonli. Bosh sahifa
  raqamlari ham shu manbadan (bo'sh bo'lsa `INSTITUTE_STAFF`).
- Ochiq sahifa: hero + sanab chiquvchi raqamlar, missiya/istiqbol, qadriyatlar, tarix + vaqt
  chizig'i, lab kartochkalari, havolalar. Harakat `motion-safe`, `CountUp` ekran o'quvchiga yakuniy son.
  Bo'sh maydonlarda eski i18n matnlari ko'rinadi.
- Topilgan xato (tuzatildi): oynaga qaytganda refetch → `reset` saqlanmagan matnni o'chirardi →
  forma faqat bir marta to'ldiriladi + `refetchOnWindowFocus: false`.
- **Tekshirildi:** tsc (api+web), 68 vitest, `wrangler --dry-run`; curl: GET 200, PUT tokensiz 401,
  noto'g'ri tana 400, `about_page` bulk 400, ochiq settings'da pochta yo'q; brauzerda: ochiq sahifa
  (1 ta h1, sarlavha tartibi, gorizontal siljish yo'q, konsol toza), admin'da raqam kiritib saqlash →
  API'da ko'rindi, fokus hodisasidan keyin qiymat saqlanib qoldi; sozlamalar sahifasi yuklanadi.
- **Tekshirilmadi:** mobil kenglik ko'zda, en/ru ochiq sahifa ko'zda, qorong'i mavzuda admin sahifa.
- Jurnal 250 qatordan oshgan (avvaldan) — arxivlash keyingi sessiyaga.

### 2026-10-28 — feat(web): qidiruv navbar'ning o'zida, davr filtri navbar ikonkasida
- Foydalanuvchi: modal noqulay. `AdminSearch` endi navbar'dagi haqiqiy maydon, natijalar ostida
  ochiladigan panelda (tashqariga bosish / Escape / sahifa almashishi yopadi, `Ctrl/⌘+K` fokus beradi).
- Yangi `PeriodFilter` (navbar, `SlidersHorizontal` ikonkasi): tayyor davrlar ro'yxati + «Oraliq»
  (Dan/Gacha sanalari). Standartdan farqli davrda ikonka rangi + nuqta. Escape/tashqariga bosish yopadi.
- Yangi `store/adminPeriod.ts` (zustand): umumiy davr; dashboard grafiklari va qidiruv shundan o'qiydi.
  Dashboard'dagi filtr kartochkasi va `DashboardFilters.tsx` o'chirildi, URL dagi `?period=` endi yo'q
  (davr sahifa yangilanganda 1 yilga qaytadi). Davr xulosasi dashboard sarlavhasi ostida.
- Tekshirildi: `tsc`, `vite build`; brauzer: oraliq 25 Avg–5 Sen → kunlik grafiklar va xulosa;
  «7 kun» da qidiruv murojaatlarni chiqarmaydi (ular 31 Avg), xodimlar chiqadi; Escape panelni yopadi.
- Tekshirilmadi: mobil kenglikda navbar sig'ishi, qorong'i mavzu skrinshoti.

### 2026-10-27 — feat: dashboard davr filtri va admin navbar qidiruvi
- API `GET /api/stats`: `from`/`to` (`YYYY-MM-DD`, zod), standart — oxirgi 12 oy. ≤62 kun → kunlik,
  aks holda oylik (`newsSeries`/`appealsSeries`, `range`, `period`). Holat bo'yicha murojaatlar va
  nashrlar (yil bo'yicha) oraliqqa bog'liq; xodimlar bo'linmalar bo'yicha — joriy holat. Xato oraliq → 400.
- Tuzatildi: `timestamp without time zone` ustunida `AT TIME ZONE 'Asia/Tashkent'` vaqtni 5 soat
  ORQAGA surardi (15:00, 01:00 o'rniga) — endi `AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tashkent'`.
- API `GET /api/stats/search?q` (requireAuth, 2–100 belgi): yangiliklar (qoralama ham), nashrlar,
  xodimlar, murojaatlar (raqam/ism/mavzu), har turdan 5 ta, `contains` insensitive.
- Web: `DashboardFilters` — bitta qatorda segmentli tugmalar (7 kun…1 yil, Joriy yil, Oraliq),
  «Oraliq»da shu qatorda ikki sana; holat URL da (`?period=`). `AdminSearch` — navbar chapida keng
  qidiruv tugmasi (mobil: ikonka), `Ctrl/⌘+K`, modal (`useFocusTrap`, Escape, `aria-live`).
  `BarCard`: `note` prop, ko'p ustunda yorliqlar siyraklashadi. Matnlar uz/en/ru.
- `lib/stats.ts`: `resolveRange`, `fillPeriods`, `fillYearRange`; eski oylik yordamchilar o'chirildi.
- Tekshirildi: 68 vitest, `tsc` (api/web), `wrangler --dry-run`; HTTP (lokal, mint qilingan token):
  standart/kunlik/oylik javoblar, 400 (from>to, noto'g'ri sana, q=1 belgi), 401 tokensiz, qidiruv
  natijalari bazaga mos; SQL da TZ ifodasi solishtirildi. Brauzer: 30d/oraliq URL, kunlik grafiklar,
  modal qidiruv, Escape → fokus qaytadi, `/admin/news` da Ctrl+K, konsolda xato yo'q.
- Tekshirilmadi: mobil kenglikda filtr qatori (flex-wrap), ochiq rejim skrinshoti, production.
- Qidiruv natijasi bo'lim ro'yxatiga olib boradi (yozuvning o'ziga emas) — sahifalarda chuqur havola yo'q.

### 2026-10-27 — feat(web): hamkorlar kartochkasi barcha qurilmalar uchun
- `PartnersStrip.tsx`: logotip o'rniga kartochka (oq fon, chegara, soya, hover ko'tarilish), ichida
  logotip + nom (4 qatorgacha). Kenglik: mobil `w-44`, `sm:w-48`, `lg:w-56`. Logotip `alt=""`, nom matn
  bilan; havolada `sr-only` «yangi oynada ochiladi», klon kartochkalar `tabIndex=-1`.
- Hamkorlar 5 tadan kam bo'lsa lenta aylanmaydi — markazda setka (`MARQUEE_MIN`). Lenta chetlari
  `mask-image` bilan xiralashadi (`index.css`), `prefers-reduced-motion` da mask o'chadi.
- Namuna (FAQAT lokal baza): «O'zbekiston Respublikasi Fanlar akademiyasi» (uz/en/ru), logotip
  academy.uz dan olinib `POST /api/uploads` orqali yuklandi, sayt `https://academy.uz`, order 0.
- Tekshirildi: `tsc --noEmit`, `vite build`; brauzerda 1555px va 500px kenglikda (skrinshot),
  rasm yuklanishi va nom kesilmasligi DOM orqali.
- Tekshirilmadi: `<5` hamkor setka holati brauzerda (lokalda 8 ta hamkor bor); production bazasi.
- Lokal bazada 7 ta test hamkor (`test-partner-02..08`) qolgan — o'chirish foydalanuvchi qarori.
- Topilgan, tuzatilmagan: mobilda `test-banner-track` gorizontal toshish beradi (scrollWidth 2480).
- Jurnal 250 qatordan oshgan (HOZIRGI HOLAT o'zi ~210 qator) — arxivlash alohida ish.

### 2026-10-27 — fix(api): rasmli matnni saqlash 500 bermaydi, eski rasmlar o'chadi
- Sabab: `syncContentFiles` dagi `mediaFile.updateMany` Prisma'da tranzaksiya ochadi, Neon HTTP
  rejimida — "Transactions are not supported in HTTP mode" (error_logs: PUT /api/structure/:id, 3 marta).
  Yozuv yangilanardi, lekin javob 500 va eskirgan rasmlar o'chirilmasdi.
- `lib/media.ts`: yangi `assignOwner()` — xom SQL `UPDATE ... WHERE key IN (...)`; `syncContentFiles`
  va `documents.ts` (create/put) shundan foydalanadi. Production (Node + oddiy pg) bu xatoga duch kelmasdi.
- Tekshirildi (HTTP, lokal): PUT lab → 200; test rasm yuklab matnga qo'shildi → 200, fayl 200;
  matndan olib saqlandi → 200, fayl 404 va `media_files` dan o'chdi; ishlatilayotgan rasm qoldi.
  Lokal bazadagi 2 ta eskirgan lab rasmi shu jarayonda o'chdi. `tsc`, 66 test, build toza.
- Tekshirilmadi: hujjatlar (`documents.ts`) yo'li HTTP bilan; skrinshotdagi singan rasm qayta
  hosil qilinmadi (hozir lab sahifasi va tahrirlagichda rasm yuklanadi). Jurnal 250 qatordan oshgan — arxivlash kerak.

### 2026-10-27 — fix: lab sahifasida rasmlar o'rtada
- `LabDetailPage.tsx`: «Laboratoriya haqida» ichidagi `img` — `block mx-auto my-4 max-w-full h-auto rounded-xl`
  (faqat shu sahifada; yangiliklarning `prose-content` i tegilmadi).
- Tekshirildi: `tsc`; brauzerda DOM o'lchovi — 120px rasmda chap/o'ng bo'shliq teng (89/89).

### 2026-10-27 — fix: lab sahifasida matn mobil'da ham ikki tomonga tekislanadi
- Foydalanuvchi so'rovi bilan `sm:text-justify` → `text-justify` (hero tavsifi va «Laboratoriya haqida»).
- Tekshirildi: `tsc --noEmit` (web). Avvalgi skrinshotda (606px) justify so'zlar orasida katta bo'shliq
  qoldirgan — o'zbek tili uchun brauzerda defis lug'ati yo'q; bu foydalanuvchiga aytildi.

### 2026-10-27 — feat: laboratoriya sahifasi — matn va oraliqlar
- `LabDetailPage.tsx`: hero `py-12/16` → `py-8/12`, h1 mobil'da `text-2xl`, hero tavsifi `line-clamp-4`
  (asosiy matn bilan takrorlanmasin), statistika chiplari ixchamroq. Asosiy blok `py-8/10`, h2 `text-xl/2xl`.
  «Laboratoriya haqida» matni `sm:` dan boshlab ikki tomonga tekislanadi (mobil'da chapga — tor ustunda
  justify katta bo'shliq qoldiradi). Aloqa paneli bo'lmasa grid bir ustunli + `max-w-4xl` (o'qish uzunligi);
  bo'lsa 18rem, `p-5`. E-pochta `break-all` o'rniga «@» oldida `<wbr>` bilan bo'linadi.
- Tekshirildi: `tsc --noEmit` (web); `/uz/laboratories/lab-energy-security` brauzerda desktop (1555px)
  va tor (606px) kenglikda ko'rildi.
- Tekshirilmadi: rahbari va xodimlari bor lab (lokal bazada 0 xodim). Yangiliklar sahifasidagi
  `prose-content` tegilmadi — ehtimol unga ham xuddi shu tekislash kerak.

### 2026-10-27 — feat: laboratoriya kartochkasi ixchamlashtirildi
- `LabsPage.tsx`: kartochka tanasi `p-6` → `p-4 sm:p-5`, sarlavha mobil'da `text-base`, tavsif
  `text-justify`; «N xodim» va «Batafsil →» pastki bitta qatorda (chap/o'ng); rahbar (bo'lsa) tavsif
  ostida alohida kichik qatorga ko'chirildi.
- Tekshirildi: `tsc --noEmit` (web) toza; `/uz/laboratories` brauzerda ochib ko'rildi (desktop, 6 lab).
- Tekshirilmadi: mobil kenglik; rahbari bor lab (lokal bazada hamma labda 0 xodim). Tor ustunda
  `text-justify` so'zlar orasini kengaytiradi — o'zbek tili uchun brauzerda defis lug'ati yo'q.
- Eslatma: jurnal 250 qatordan oshgan — keyingi sessiya arxivlashi kerak.

### 2026-10-27 — fix: admin tahrirlagichda rasm ko'rinmasdi
- Sabab: tiptap `<img src="/api/files/...">` ni nisbiy manzil bilan chizardi → so'rov Vite (5173) ga
  ketardi, API esa boshqa domenda (lokal 8787, prod alohida domen). Ochiq sahifa `sanitize.ts` orqali
  `fileUrl()` qo'llagani uchun u yerda ishlardi.
- Tuzatish: `RichTextEditorInner.tsx` — `EditorImage` (Image.extend + addNodeView), ko'rsatishda
  `fileUrl()`; `getHTML()` o'zgarmaydi, bazaga nisbiy manzil yoziladi.
- Tekshirildi: `tsc --noEmit` (web) toza; brauzerda `/admin/labs/lab-energy-security` — rasm
  `localhost:8787` dan yuklandi (naturalWidth>0). Ochiq lab sahifasi ko'rib chiqildi.
- Tekshirilmadi: yangi rasm yuklab saqlash oqimi (o'zgarmagan kod), prod.
- Eslatma: lokal `lab-energy-security` dagi kontent test ma'lumot (takroriy matn, admin skrinshoti
  rasm sifatida, shaxsiy pochta) — haqiqiy ma'lumot foydalanuvchidan kutilmoqda.


> Eng yangisi tepada. Har bir yozuv qisqa bo'lsin — nima qilindi, nima tekshirildi, nima qolib ketdi.

### 2026-10-27 · `/laboratories` sarlavha bloki ixchamlashtirildi
- Hero `py-14 sm:py-20` → `py-12` (boshqa ochiq sahifalar bilan bir xil), bezak ikonka 64→48, nishon `mt-6`→`mt-4`.
  U yerga rasm joylanmaydi — bo'sh joy faqat ortiqcha padding edi.
- Tekshirildi: `tsc --noEmit` (web). Brauzerda ko'rilmadi.

### 2026-10-27 · Laboratoriya «Ilmiy yo'nalishlar» olib tashlandi

Foydalanuvchi qarori: yo'nalishlar to'liq matn ichida yoziladi, alohida maydon kerak emas.
Olib tashlandi: `/laboratories` kartochkasidagi teglar, lab sahifasidagi bo'lim va statistika,
admin formadagi bo'lim/«O'zbekchadan nusxa»dagi qator, admin ro'yxatdagi hisoblagich va to'liqlik
bandi (6 → 5), `countLines`, tegishli i18n kalitlari (uchala til).
**Ataylab qoldirildi:** DB ustunlari `directions*` va API sxemasi — o'chirish migratsiya va
ma'lumot yo'qotishni talab qiladi; `PUT` `partial()` bo'lgani uchun eski qiymat ustiga yozilmaydi.
**Tekshirildi:** `tsc --noEmit` (web) toza; JSON fayllar to'g'ri; brauzerda ro'yxat (6 kartochka,
teglar yo'q) va `lab-renewable` sahifasi (h2: haqida/xodimlar/bog'lanish).
**Tekshirilmadi:** admin sahifalari brauzerda (login talab qiladi), production.

### 2026-10-27 · Laboratoriya kartochkalari — yangi dizayn

`LabsPage` kartochkasi: baland bo'sh 16:9 blok o'rniga `h-40` sarlavha — nuqtali naqsh,
oltin va ko'k nur (blur), katta xira tartib raqami (01–06), shisha ikonka plitkasi (hover'da
oltin rangga o'tadi), sarlavha ostida hover'da chiziladigan oltin chiziq. Rasm bo'lsa — `object-cover`
va pastdan qoraytirish. Kuchliroq soya/ko'tarilish; barcha animatsiyalarda `motion-reduce`.
**Tekshirildi:** `tsc --noEmit` (web) toza; `/uz/laboratories` brauzerda ochildi, skrinshot ko'rildi.
**Tekshirilmadi:** rasmli lab (lokal bazada yo'q), mobil kenglik, production.

### 2026-10-27 · Xodim kartochkasi — mobil va planshet uchun qayta dizayn

`EmployeeCard`: `sm` dan tor ekranda vertikal — gradient lenta, 3x4 sm surat markazda lenta
ustiga chiqib turadi (oq halqa + soya), matn markazda, email/telefon to'liq kenglikdagi
44 px tugmalar, ORCID/Scopus kapsula. `sm` dan — yonma-yon, tepada ingichka gradient chiziq,
hover'da ko'tarilish va surat kattalashishi (`motion-safe`). Email faqat `@` oldidan bo'linadi.
Ikki ustun: xodimlar sahifasida `md` → `lg`, lab sahifasida `md` → `xl` (tor ustunda email sinardi).
**Tekshirildi:** `tsc --noEmit` (web) toza; iframe orqali 320/335/360/375/390/420/589/768/982/1280 px —
hech birida gorizontal siljish yo'q, skrinshotlar ko'rildi (xodimlar, rahbariyat).
**Tekshirilmadi:** lab sahifasidagi kartochka (lokal bazada lab xodimi yo'q), haqiqiy telefon, production.
