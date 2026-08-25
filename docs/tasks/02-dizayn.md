# Topshiriq 02 — Dizaynni takomillashtirish: ranglar va rasmlar

**Ustuvorlik:** 🟠 O'rta — 01-topshiriq (login) tugagandan keyin
**Tegishli fayllar:** `apps/web/tailwind.config.js`, `apps/web/src/index.css`, `apps/web/src/pages/public/HomePage.tsx`, `apps/web/src/components/layout/Header.tsx`, `apps/web/src/components/layout/Footer.tsx`, `apps/web/public/`

---

## Muammo

### 1. Sayt haddan tashqari to'q

`primary` palitrasi juda to'yingan elektr-ko'k: `primary-600` = `#0038f5`, `primary-950` = `#001260`.
Bunday rang ilmiy muassasadan ko'ra fintech startapga xos.

Bundan tashqari, bosh sahifada **uchta katta to'q blok** ketma-ket keladi:

| Joy | Hozirgi klass |
|---|---|
| Header ustki paneli | `bg-primary-900` |
| Hero seksiyasi | `bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800` |
| Pastki CTA seksiyasi | `bg-primary-900` |

Natijada sahifa "og'ir" va zich ko'rinadi.

### 2. Sahifada birorta ham rasm yo'q

- Hero — faqat gradient va `blur-3xl` bilan xiralashtirilgan ikkita rangli doira.
- Yangilik kartochkalari rasmni faqat `item.imageUrl` mavjud bo'lsagina ko'rsatadi; bazada hammasi `null`.
  Shu sabab kartochkalar turli balandlikda va bo'sh ko'rinadi.
- Nashrlar ro'yxati — faqat ikonka va matn.

Butun bosh sahifa matn va rang bloklaridan iborat.

---

## Nima qilish kerak

### 1. Yangi rang palitrasi — akademik ko'k + oltin

`tailwind.config.js` dagi `primary` va `accent` to'liq almashtirilsin.

**primary** — bosiq, to'yinganligi past navy (universitet/akademiya uslubi):

```
50   #f4f7fa
100  #e6edf5
200  #c7d8e8
300  #9bb8d4
400  #6892b8
500  #43719c
600  #325882
700  #28466a
800  #1f3855
900  #1a3a5f   ← asosiy to'q ton
950  #12283f
```

**accent** — issiq oltin (hozirgi to'q sariq `#f97414` o'rniga):

```
50   #fdf9ef
100  #f9efd6
200  #f2dda9
300  #e8c476
400  #d9a94f
500  #c8973f   ← asosiy akzent
600  #ab7a30
700  #8a5f2a
800  #714e28
900  #5f4224
```

Palitra o'zgargach, **butun loyiha bo'ylab** `primary-*` va `accent-*` ishlatilgan joylar ko'rib chiqilsin — ba'zi joyda ton raqamini moslash kerak bo'ladi (masalan matn kontrasti).

### 2. To'q bloklarni kamaytirish

Qoida: **bitta sahifada bittadan ortiq to'liq to'q seksiya bo'lmasin.**

- **Header ustki paneli** — `bg-primary-900` o'rniga engil variant: `bg-primary-50` fon, `text-primary-800` matn, pastida `border-b border-primary-100`.
- **Hero** — gradient o'rniga rasm + qoplama (3-bo'limga qarang). Balandligi `py-20 lg:py-32` dan `py-16 lg:py-24` ga kamaytirilsin.
- **Pastki CTA** — to'liq to'q fon o'rniga: `bg-primary-50` fon, `text-primary-900` sarlavha, tugma `bg-primary-800 text-white`. Yagona to'q element — tugma.

`blur-3xl` bilan qilingan dekorativ doiralar olib tashlansin — ular hero rasm bilan almashtiriladi.

### 3. Hero uchun rasm + qoplama

Struktura:

```
rasm (background, object-cover)
  └─ qoplama: bg-gradient-to-r from-primary-950/85 via-primary-900/70 to-primary-900/30
      └─ matn (oq)
```

Qoplama chapdan o'ngga shaffoflashsin — matn chapda o'qiladi, rasm o'ngda ko'rinadi.

**Rasm manbai:** hozircha haqiqiy rasmlar yo'q. Vaqtinchalik yechim:

- `apps/web/public/images/` papkasi yaratilsin.
- Hero uchun **SVG placeholder** yasalsin (`hero-placeholder.svg`): bosiq geometrik naqsh — elektr tarmog'i / quyosh paneli panjarasi motivi, primary va accent ranglarida. Foto emas, abstrakt grafika.
- Fayl nomlari haqiqiy rasm kelganda almashtirish oson bo'ladigan qilib qo'yilsin.

**Muhim:** internetdan tayyor rasm yuklab ishlatmang. Bu rasmiy davlat muassasasi sayti — litsenziyasi noaniq rasm huquqiy muammo tug'diradi. Faqat o'zimiz yasagan SVG yoki keyinchalik institut bergan rasmlar.

### 4. Yangilik kartochkalari uchun placeholder

`item.imageUrl` `null` bo'lganda kartochka bo'sh qolmasin:

- Rasm o'rnida `aspect-[16/9]` nisbatdagi blok ko'rsatilsin: `bg-primary-50` fon va markazda yirik, past kontrastli `Beaker` yoki `Zap` ikonkasi (`lucide-react`).
- Shunda barcha kartochkalar bir xil balandlikda bo'ladi.

### 5. Bosh sahifaga yangi statik seksiya

Hozir sahifa: Hero → Stats → Yangiliklar → Nashrlar → CTA.
Stats va Yangiliklar orasiga **"Institut haqida qisqacha"** seksiyasi qo'shilsin:

- Ikki ustunli joylashuv (`lg:grid-cols-2`): chapda matn, o'ngda tasvir.
- Matn: 2–3 abzas, institut faoliyati haqida. **Hard-code qilinmasin** — `home.about_*` kalitlari bilan uchala `locales/*.json` ga qo'shilsin.
- "Batafsil" tugmasi `/about` ga olib borsin.
- O'ng tomonda — 3-bo'limdagi kabi SVG placeholder.

### 6. Stats seksiyasini jonlantirish

Hozir raqamlar `stats` massivida `icon` bilan belgilangan, lekin ikonka **umuman chizilmayapti** — faqat `value` va `label` ko'rsatiladi. Ikkita ikonka ham bir xil (`Beaker`).

- Har bir statistika uchun mos ikonka: laboratoriya → `Beaker`, nashrlar → `BookOpen`, xodimlar → `Users`, yillar → `Calendar`.
- Ikonka raqam ustida, `text-accent-500` rangida chizilsin.
- Blok `bg-white` o'rniga `bg-primary-50` bo'lsin — hero'dan keyin yumshoq o'tish beradi.

---

## Qabul mezonlari

- [ ] `npx tsc --noEmit` — `apps/web` da xato yo'q.
- [ ] `npm run build --workspace=apps/web` muvaffaqiyatli.
- [ ] `npm run dev` da bosh sahifa ochiladi, konsolda xato yo'q.
- [ ] Bosh sahifada **bittadan ortiq to'liq to'q seksiya yo'q**.
- [ ] Hero'da tasvir ko'rinadi, matn ustida o'qilishi aniq (kontrast yetarli).
- [ ] Yangilik kartochkalari `imageUrl` `null` bo'lganda ham bir xil balandlikda.
- [ ] "Institut haqida" seksiyasi mavjud va **uchala tilda** ishlaydi (uz/en/ru almashtirib tekshiring).
- [ ] `locales/uz.json`, `en.json`, `ru.json` — uchalasida ham yangi kalitlar bor, birortasi qolib ketmagan.
- [ ] Barcha sahifalar (About, Structure, Labs, News, Publications, Contact) yangi palitrada ham normal ko'rinadi — hech qayerda o'qib bo'lmaydigan matn yo'q.
- [ ] Mobil kenglikda (375px) tekshirilgan — hero matni va tugmalar to'g'ri joylashadi.
- [ ] `apps/web/public/images/` dagi SVG'lar loyihada o'zimiz yasagan, tashqaridan yuklanmagan.

## Tugatgandan keyin

- Kommit: `feat(ui): academic navy + gold palette, hero imagery, lighter sections`
- **Push qilmang.**
- O'zgarishlarni qisqacha ayting: qaysi fayllar, qaysi seksiyalar o'zgardi.

## Keyingi qadam (bu topshiriqqa kirmaydi)

Haqiqiy rasmlar kelgach — institut binosi, laboratoriyalar, xodimlar — ular `public/images/` dagi placeholder'lar o'rniga qo'yiladi.
Yangiliklar uchun rasm yuklash esa alohida ish: R2 binding kerak (`docs/tasks/` da keyinroq).
