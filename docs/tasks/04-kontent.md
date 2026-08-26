# Topshiriq 04 — Demo ma'lumotni haqiqiy kontent bilan almashtirish

**Ustuvorlik:** 🟠 Yuqori — 03-production dan keyin
**Tegishli fayllar:** `packages/db/prisma/schema.prisma`, `packages/db/src/seed.ts`, `apps/web/src/i18n/locales/*.json`, `apps/web/src/pages/public/AboutPage.tsx`, `LabsPage.tsx`, `StructurePage.tsx`

---

## Muammo

Bazadagi barcha ma'lumot — **o'ylab topilgan demo**:

- `prof. Mirzayev A.K.`, `Toshmatov R.N.` — mavjud bo'lmagan shaxslar. Rasmiy davlat
  muassasasi saytida soxta ism turishi qabul qilib bo'lmaydigan holat.
- Tuzilma taxminiy: "Quyosh energetikasi laboratoriyasi", "Shamol energetikasi sektori",
  "Aqlli tarmoqlar bo'limi" — bularning hech biri haqiqiy tuzilmada yo'q.
- Bosh sahifadagi statistika (`8+`, `12+`, `500+`, `30+`) ham asossiz.

Endi rasmiy hujjat bor, shunga o'tamiz.

---

## Manba

**O'zbekiston Respublikasi Fanlar akademiyasi Energetika muammolari institutining TUZILMASI**
— FA Prezidiumining **2025-yil 27-fevraldagi 12-son qarori, 10-ilova** (muhrlangan hujjat).

Skan: `docs/reference/tuzilma-2025-02-27.jpg` — quyidagi jadvallar bilan solishtirib chiqing.
Nomuvofiqlik topsangiz, **hujjat ustun**, jadval emas — va menga xabar bering.

Hujjatdagi izohlar:
- Institut xodimlarining umumiy cheklangan soni — **29 nafar**, shundan ilmiy xodimlar — **18 nafar**.
- Buyurtma asosida bajariladigan ilmiy loyihalarda qatnashadigan ilmiy xodimlar shartnoma asosida jalb etiladi.
- Ilmiy-yordamchi va yordamchi xodimlar soni qonunchilik hujjatlariga muvofiq normativlar bo'yicha belgilanadi.

> Nazorat hisobi: laboratoriyalar 3+3+4+2+2+3 = 17, ustiga integratsiya-resurs markazi mutaxassisi 1 = **18**.
> Ma'muriy-boshqaruv 11 nafar. Jami **29**. Hujjat bilan mos.

---

## 1. Schema o'zgarishi

`StructureUnit` modelida hozir shtat birligi soni yo'q, `type` qiymatlari ham yetarli emas.

- `staffCount Int?` qo'shilsin — hujjatdagi raqam (masalan laboratoriya uchun `3`).
  Nullable, chunki Direktor / Ilmiy kengash kabi birliklarda raqam ko'rsatilmagan.
- `type` uchun qo'shimcha qiymatlar: `council` (Ilmiy kengash), `position` (yakka lavozim —
  Ilmiy kotib, Bosh yuriskonsult, AKT bo'yicha mutaxassis), `service` (Injener-texnik va xo'jalik xizmati).
- `isAdvisory Boolean @default(false)` — Ilmiy kengash uchun. Hujjatda u **punktir chiziq** bilan
  bog'langan, ya'ni bo'ysunuvchi emas, maslahat organi. Frontendda ham shunday ko'rsatilishi kerak.

**Migratsiya yozing** (`prisma migrate dev`), `db push` ishlatmang — CLAUDE.md 8-qoida.

## 2. Tuzilma — seed ma'lumoti

Eski demo yozuvlar (`dept-solar`, `dept-wind`, `dept-grid`, `dept-energy-systems`,
`dept-renewable`, `dept-efficiency`, `director`) o'rniga quyidagilar.
**`head` maydoni hamma joyda `null`** — haqiqiy ism-sharifni institut o'zi kiritadi.
Hech qanday ism o'ylab topmang.

### Boshqaruv

| id | uz | en | ru | type | parent | soni |
|---|---|---|---|---|---|---|
| `director` | Direktor | Director | Директор | `position` | — | — |
| `academic-council` | Ilmiy kengash | Academic Council | Учёный совет | `council` | `director` | — |
| `scientific-secretary` | Ilmiy kotib | Scientific Secretary | Учёный секретарь | `position` | `director` | — |
| `deputy-science` | Ilm-fan bo'yicha direktor o'rinbosari | Deputy Director for Science | Заместитель директора по науке | `position` | `director` | — |
| `deputy-general` | Umumiy masalalar bo'yicha direktor o'rinbosari | Deputy Director for General Affairs | Заместитель директора по общим вопросам | `position` | `director` | — |

`academic-council` uchun `isAdvisory = true`.

### 6 ta ilmiy laboratoriya (`deputy-science` ostida, `type: laboratory`)

| id | Nomi (uz) | en | ru | soni |
|---|---|---|---|---|
| `lab-energy-security` | "Energetikaning rivojlanish istiqbollari va energetik xavfsizlik" ilmiy laboratoriyasi | Laboratory for Energy Development Prospects and Energy Security | Лаборатория перспектив развития энергетики и энергетической безопасности | 3 |
| `lab-power-systems` | "Elektr energetika tizimlari va majmualari" ilmiy laboratoriyasi | Laboratory of Electric Power Systems and Complexes | Лаборатория электроэнергетических систем и комплексов | 3 |
| `lab-renewable` | "Muqobil va qayta tiklanuvchi energiya manbalaridan kompleks foydalanish" ilmiy laboratoriyasi | Laboratory for Integrated Use of Alternative and Renewable Energy Sources | Лаборатория комплексного использования альтернативных и возобновляемых источников энергии | 4 |
| `lab-electrotech` | "Elektrotexnologiyalar va energetik uskunalarni ekspluatatsiya qilish" ilmiy laboratoriyasi | Laboratory of Electrotechnologies and Operation of Power Equipment | Лаборатория электротехнологий и эксплуатации энергетического оборудования | 2 |
| `lab-efficiency` | "Energiya samaradorligi va energiya tejash tizimlari" ilmiy laboratoriyasi | Laboratory of Energy Efficiency and Energy Saving Systems | Лаборатория энергоэффективности и систем энергосбережения | 2 |
| `lab-smart-grid` | "Intellektual energiya tizimlari, energetik tizimlar va quvvatlarni integratsiyalash" ilmiy laboratoriyasi | Laboratory of Intelligent Energy Systems and Integration of Power Systems and Capacities | Лаборатория интеллектуальных энергетических систем, интеграции энергосистем и мощностей | 3 |

Yana `deputy-science` ostida:

| id | uz | en | ru | type | soni |
|---|---|---|---|---|---|
| `integration-center` | Integratsiya-resurs markazi mutaxassisi | Integration and Resource Centre Specialist | Специалист интеграционно-ресурсного центра | `position` | 1 |

### Ma'muriy bo'linmalar

| id | uz | en | ru | type | parent | soni |
|---|---|---|---|---|---|---|
| `engineering-service` | Injener-texnik va xo'jalik xizmati | Engineering and Maintenance Service | Инженерно-техническая и хозяйственная служба | `service` | `deputy-general` | — |
| `finance-dept` | Moliya-iqtisodiyot bo'limi | Finance and Economics Department | Финансово-экономический отдел | `department` | `director` | 3 |
| `legal-counsel` | Bosh yuriskonsult | Chief Legal Counsel | Главный юрисконсульт | `position` | `director` | 1 |
| `hr-chancellery` | Xodimlar bo'yicha inspektor va devonxona | HR Inspector and Chancellery | Инспектор по кадрам и канцелярия | `position` | `director` | 2 |
| `ict-specialist` | AKT bo'yicha mutaxassis | ICT Specialist | Специалист по ИКТ | `position` | `director` | 1 |

`engineering-service` uchun izoh (uchala tilda): ilmiy-yordamchi va yordamchi xodimlar soni
qonunchilik hujjatlariga muvofiq normativlar bo'yicha belgilanadi.

## 3. Institut haqida — "Biz haqimizda" matni

Quyidagi ma'lumot ochiq manbalardan olingan (kun.uz, academy.uz). **Institut tasdiqlashi kerak**
degan belgisi bor bandlarni sayt matniga qo'yishdan oldin foydalanuvchidan so'rang.

### Tasdiqlangan (rasmiy manbalar)

Institut Vazirlar Mahkamasi qarori bilan tashkil etilgan (2021-yil). Faoliyatining asosiy
yo'nalishlari qaror bilan belgilangan:

- respublikada energetika barqaror rivojlanishining kelajak strategiyasini ishlab chiqish,
  yoqilg'i-energetika kompleksini modernizatsiya qilish dasturlarini tayyorlashda ishtirok etish;
- muqobil energiya asosidagi yangi texnologiyalar va energetik uskunalarni respublika iqlim
  sharoitlarida sinovdan o'tkazish;
- iqtisodiyot tarmoqlarida energiya sarfini pasaytirish bo'yicha kompleks tadqiqotlar;
- "intellektual tarmoqlar" nazariyasini rivojlantirish va energetikaga joriy etish;
- mamlakatning energetik xavfsizligini ta'minlash, favqulodda vaziyatlarda yoqilg'i-energetika
  kompleksi obyektlarining barqaror faoliyatini ta'minlash;
- mintaqa davlatlari o'rtasida yoqilg'i-energiya manbalaridan birgalikda foydalanish bo'yicha
  ilmiy asoslangan tavsiyalar;
- energetika sohasi uchun yuqori malakali kadrlar tayyorlashda ishtirok etish.

Bu ro'yxatdan **4–6 tasi tanlanib**, "Biz haqimizda" sahifasiga qo'yilsin (hammasi emas — uzun bo'ladi).

### Institut tasdiqlashi kerak

- **Manzil.** Ochiq manbada: Toshkent shahri, Yunusobod tumani, Chingiz Aytmatov ko'chasi, 2B.
  Hozir saytda boshqa manzil turgan bo'lishi mumkin — solishtiring va foydalanuvchidan so'rang.
- **Tashkil etilgan aniq sana va qaror raqami.** Manbalar bir-biriga zid: 2020-yildagi loyiha
  e'loni va 2021-yil 4-maydagi 273-son qaror haqida ma'lumot bor. **Aniq sanani o'ylab topmang** —
  institutdan so'rashi uchun foydalanuvchiga savol qoldiring.
- **Telefon va email.** Hozirgi `+998712620000` / `info@energetika.uz` — demo qiymat bo'lishi mumkin.

## 4. Bosh sahifadagi statistika

Hozirgi `8+ / 12+ / 500+ / 30+` asossiz. Hujjatdan kelib chiqadigan haqiqiy raqamlar:

| Ko'rsatkich | Qiymat | Manba |
|---|---|---|
| Ilmiy laboratoriyalar | **6** | tuzilma hujjati |
| Ilmiy xodimlar | **18** | tuzilma hujjati |
| Umumiy xodimlar | **29** | tuzilma hujjati |
| Nashrlar | ? | **o'ylab topmang** — bazadagi haqiqiy `publications` sonidan hisoblang yoki bu blokni olib tashlang |

`+` belgisi olib tashlansin — bular aniq raqamlar, taxmin emas.

## 5. Laboratoriyalar sahifasi

`LabsPage` hozir umumiy `structure` dan `type: laboratory` bo'lganlarni ko'rsatadi.
6 ta laboratoriya uchun kartochka: nomi, xodimlar soni, qisqa tavsif.

**Tavsiflarni o'zingiz yozing, lekin ular loyiha hujjatida yo'q** — shuning uchun har bir
tavsif ostiga `TODO: institut tasdiqlashi kerak` izohi qo'ying va foydalanuvchiga ro'yxat bering.
Laboratoriya nomidan kelib chiqmaydigan hech narsa yozmang (aniq loyihalar, natijalar, grantlar —
bularni bilmaysiz).

---

## Qabul mezonlari

- [ ] Migratsiya yozilgan (`prisma migrate dev`), `db push` ishlatilmagan.
- [ ] `npx tsc --noEmit` — api va web da toza.
- [ ] `npm run build` — ikkala app.
- [ ] Seed ishga tushirilgan, `GET /api/structure` yangi tuzilmani qaytaradi.
- [ ] **Bazada `Mirzayev`, `Toshmatov` va boshqa o'ylab topilgan ismlar qolmagan** (`grep` bilan tekshiring).
- [ ] `head` maydoni hamma joyda `null` — hech qanday ism o'ylab topilmagan.
- [ ] Tuzilma daraxti to'g'ri: Direktor → 2 o'rinbosar + Ilmiy kotib + 4 ma'muriy birlik;
      Ilm-fan o'rinbosari → 6 laboratoriya + integratsiya-resurs markazi.
- [ ] Ilmiy kengash maslahat organi sifatida ajratib ko'rsatilgan (bo'ysunuvchi emas).
- [ ] Xodimlar sonlari hujjatga mos: 3, 3, 4, 2, 2, 3, 1, 3, 1, 2, 1.
- [ ] `StructurePage` va `LabsPage` brauzerda ochiladi, 6 ta laboratoriya ko'rinadi.
- [ ] **Uchala tilda** (uz/en/ru) tekshirilgan — birorta kalit qolib ketmagan.
- [ ] Bosh sahifa statistikasi hujjatdagi raqamlarga mos.

## Tugatgandan keyin

- `CLAUDE.md` 5-jadvalda 8-qator (`Bazada faqat demo ma'lumot`) yangilansin.
- `docs/JOURNAL.md` — "HOZIRGI HOLAT" + yangi yozuv.
- Kommit: `feat(content): replace demo data with official 2025 institute structure`
- **Push qilmang.**
- Foydalanuvchiga **aniq savollar ro'yxati** bering: manzil, tashkil etilgan sana, telefon, email,
  rahbarlar ism-sharifi, laboratoriya tavsiflari.
