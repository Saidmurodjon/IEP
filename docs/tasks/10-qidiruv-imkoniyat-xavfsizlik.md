# Topshiriq 10 — Qidiruv, maxsus imkoniyatlar va xavfsizlik sarlavhalari

**Ustuvorlik:** 🟠 Yuqori
**Huquqiy asos:** Vazirlar Mahkamasining 2021-yil 15-iyundagi 373-son qarori, 11-band

Bu topshiriqda uchta mustaqil ish bor. Ularni ketma-ket bajarish mumkin, lekin
har biri alohida kommit qilinsin.

---

# A qism. Sayt bo'ylab kengaytirilgan qidiruv

Qarorning 11-bandida `veb-sayt bo'yicha kengaytirilgan izlash` majburiy funksiya
sifatida ko'rsatilgan.

## A1. Ma'lumotlar bazasi tomoni

PostgreSQL ning to'liq matnli qidiruvi ishlatilsin.

Har bir qidiriladigan jadvalga `searchVector` ustuni qo'shilsin va unga GIN
indeksi qo'yilsin. Ustun `tsvector` turida bo'lsin.

**Til sozlamasi `simple` bo'lsin.** PostgreSQL da o'zbek tili uchun lug'at yo'q,
shuning uchun morfologik tahlil ishlamaydi. `simple` sozlamasi so'zlarni faqat
kichik harfga o'giradi va ajratadi, bu bizning holatimizda yetarli.

Vektor yozuv saqlanganda yangilansin. Buni ma'lumotlar bazasi darajasidagi
trigger bilan emas, dastur kodida bajaring, chunki Prisma migratsiyalari bilan
trigger boshqarish murakkablashadi.

Qidiriladigan jadvallar. `News`, `Publication`, `Document`, `Employee`,
`StructureUnit`.

Har bir jadval uchun uchala tildagi matn bitta vektorga birlashtirilsin.
Sarlavhaga yuqoriroq vazn berilsin.

## A2. API

`GET /api/search` ochiq endpoint sifatida qo'shilsin.

Parametrlari. `q` qidiruv so'zi, `type` bo'lim turi, `from` va `to` sana oralig'i,
`lang` til, `page` va `limit`.

`q` kamida ikki belgidan iborat bo'lsin. Bo'sh so'rov rad etilsin.

Javobda natijalar turlari bo'yicha guruhlansin. Har bir natijada tur, sarlavha,
qisqa parcha va havola bo'lsin.

Topilgan so'z parchada ajratib ko'rsatilsin. Ajratish uchun serverda `<mark>`
teglari qo'yilsin va frontendda ular xavfsiz chiqarilsin, ya'ni butun parcha
emas, faqat ruxsat etilgan teg.

Bu endpoint ham cheklovga olinsin, bitta IP uchun daqiqasiga o'ttizdan ko'p
so'rov qabul qilinmasin.

## A3. Frontend

Sarlavhaga qidiruv maydoni qo'shilsin. Mobil ko'rinishda ikonka orqali ochilsin.

Yangi sahifa `/search`. Qidiruv so'zi manzilda saqlansin, ya'ni natijani havola
sifatida yuborish mumkin bo'lsin.

Sahifada filtrlar bo'lsin. Bo'lim turi, sana oralig'i, til.

Natija topilmasa foydali xabar chiqsin. Nima qilish mumkinligi taklif qilinsin,
masalan boshqa so'z bilan urinish yoki filtrlarni bekor qilish.

Yozish paytida so'rov har bir harfda yuborilmasin. Kamida uch yuz millisekund
kutilsin.

Qidiruv maydoni klaviatura orqali ishlasin, natijalar bo'ylab yuqoriga va
pastga tugmalari bilan harakatlanish mumkin bo'lsin.

---

# B qism. Imkoniyati cheklangan shaxslar uchun qulayliklar

Qarorda shunday yozilgan.

> imkoniyatlari cheklangan shaxslar uchun qo'shimcha qulayliklarni taqdim etish
> (kontrastni qo'shish, shriftni kattalashtirish, ovoz jo'rligi funktsiyalari va boshqalar)

Bu **majburiy** talab. Uni oxiriga qoldirmang.

## B1. Boshqaruv paneli

Sarlavhada maxsus tugma bo'lsin va u panelni ochsin. Panelda quyidagilar.

**Shrift o'lchami.** Uch daraja, oddiy, katta, juda katta. O'zgartirish butun
saytga qo'llansin.

**Kontrast.** Oddiy va yuqori kontrast rejimi. Yuqori kontrastda oq fon va qora
matn ishlatilsin, rangli bezaklar soddalashtirilsin.

**Rasmlarni o'chirish.** Bezak rasmlari yashirilsin, mazmunli rasmlar o'rniga
ularning tavsifi matn sifatida chiqsin.

**Harflar orasidagi masofani oshirish.**

**Odatdagi ko'rinishga qaytarish** tugmasi.

Tanlov `localStorage` da saqlansin va keyingi tashrifda tiklansin.

Sozlamalar CSS o'zgaruvchilari orqali amalga oshirilsin, `html` elementiga
sinf qo'shish yo'li bilan. Alohida sahifa versiyasi yaratilmasin, chunki uni
qo'llab quvvatlash ikki barobar ish talab qiladi.

## B2. Klaviatura bilan boshqarish

Butun sayt sichqonchasiz ishlashi kerak.

Har bir sahifaning boshida `Asosiy mazmunga o'tish` havolasi bo'lsin. U odatda
ko'rinmaydi, faqat klaviatura fokusi tushganda paydo bo'ladi.

Fokus ko'rinadigan bo'lsin. Hozirgi uslublarda `outline` o'chirilgan joylar
bo'lsa, ular tuzatilsin.

Ochiladigan menyu va oynalar `Escape` tugmasi bilan yopilsin. Ochiq oyna
ichida fokus qamalib qolsin, ya'ni `Tab` bosilganda oynadan tashqariga chiqmasin.

Tab tartibi sahifadagi mantiqiy tartibga mos bo'lsin.

## B3. Ekran o'qigichlar uchun

Sahifa tuzilmasi semantik teglar bilan belgilansin. `header`, `nav`, `main`,
`aside`, `footer`.

Sarlavhalar ierarxiyasi buzilmasin. Har sahifada bitta birinchi darajali
sarlavha bo'lsin va darajalar o'tkazib yuborilmasin.

Har bir rasmda `alt` matni bo'lsin. Bezak rasmlarida u bo'sh qoldirilsin,
mazmunli rasmlarda tavsif yozilsin.

Barcha shakl maydonlariga `label` bog'lansin. Faqat joy egallovchi matn
yetarli emas.

Faqat ikonkadan iborat tugmalarga `aria-label` qo'yilsin.

Til almashtirilganda `html` elementidagi `lang` atributi ham o'zgarsin.

Dinamik o'zgaradigan joylar, masalan qidiruv natijalari va xabarlar,
`aria-live` bilan belgilansin.

## B4. Rang va kontrast

Matn va fon o'rtasidagi kontrast nisbati oddiy matn uchun kamida 4,5 ga 1
bo'lsin, yirik matn uchun 3 ga 1.

02-topshiriqda tanlangan palitra shu talabga javob berishi tekshirilsin.
Berilmasa, ton raqamlari moslashtirilsin.

Ma'lumot **faqat rang orqali** yetkazilmasin. Masalan xato maydoni faqat qizil
ramka bilan emas, ikonka va matn bilan ham belgilansin.

---

# C qism. Xavfsizlik sarlavhalari

Hozir sayt hech qanday himoya sarlavhasi yubormaydi.

## C1. Frontend

`apps/web/public/_headers` fayli yaratilsin. Cloudflare Pages uni avtomatik
o'qiydi.

Quyidagilar qo'shilsin.

`Strict-Transport-Security` bir yillik muddat bilan.
`X-Content-Type-Options` qiymati `nosniff`.
`X-Frame-Options` qiymati `DENY`, ya'ni saytni ramkaga solib bo'lmaydi.
`Referrer-Policy` qiymati `strict-origin-when-cross-origin`.
`Permissions-Policy` bilan kamera, mikrofon va joylashuv o'chirilsin.

## C2. Kontent xavfsizligi siyosati

Bu eng foydali sarlavha, lekin xato sozlansa saytni buzadi.

**Avval `Content-Security-Policy-Report-Only` rejimida qo'yilsin.** Bir necha kun
kuzatilsin, konsolda qanday buzilishlar chiqishi ko'rilsin, keyin haqiqiy rejimga
o'tkazilsin.

Siyosat tuzishda quyidagilar hisobga olinsin.

`index.css` da Google Fonts dan shrift yuklanadi, demak `fonts.googleapis.com`
va `fonts.gstatic.com` ga ruxsat kerak.

Rasmlar o'z ombordan va `data:` sxemasidan keladi.

API manzili `connect-src` ga qo'shilsin.

`object-src` butunlay taqiqlansin. `base-uri` faqat o'zimizga.
`frame-ancestors` hech kimga ruxsat bermasin.

Skriptlar uchun `unsafe-inline` va `unsafe-eval` ishlatilmasin. Agar biror
joyda ular talab qilinsa, avval o'sha kodni qayta yozish mumkinmi yoki yo'qmi
tekshirilsin.

## C3. API tomoni

`apps/api/src/index.ts` ga sarlavhalar qo'shadigan oraliq qatlam yozilsin.

`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`.

Bundan tashqari `CLAUDE.md` 4-qoidasidagi CORS ro'yxati qayta ko'rib chiqilsin.
Hozir `FRONTEND_URL` bo'sh bo'lsa faqat `localhost:5173` qoladi va bu
production'da xatolikka olib keladi. Bo'sh bo'lsa xato tashlansin.

## C4. Tekshirish

Deploy qilingandan keyin sarlavhalar `curl -I` bilan tekshirilsin.

Bepul tekshirish xizmatlari ham bor, masalan `securityheaders.com`. Natija
kamida `B` darajasida bo'lsin.

---

## Qabul mezonlari

### Qidiruv

- [ ] Migratsiya yozilgan, GIN indekslari qo'yilgan.
- [ ] `GET /api/search?q=energetika` natija qaytaradi.
- [ ] Natijalar turlari bo'yicha guruhlangan.
- [ ] Filtrlar ishlaydi, sana oralig'i to'g'ri qo'llanadi.
- [ ] Bir belgili so'rov rad etiladi.
- [ ] Yangi yozuv qo'shilganda u qidiruvda darhol topiladi.
- [ ] `/search` sahifasi ochiladi, so'rov manzilda saqlanadi.
- [ ] Qidiruv maydoni klaviatura bilan ishlaydi.
- [ ] Uchala tilda tekshirilgan.

### Maxsus imkoniyatlar

- [ ] Panel ochiladi, shrift uch darajada o'zgaradi.
- [ ] Yuqori kontrast rejimi ishlaydi va butun saytga qo'llanadi.
- [ ] Tanlov sahifa yangilangandan keyin ham saqlanadi.
- [ ] Butun sayt **faqat klaviatura bilan** boshqarilishi tekshirilgan.
- [ ] `Asosiy mazmunga o'tish` havolasi ishlaydi.
- [ ] Fokus har joyda ko'rinadi.
- [ ] Ochiq oyna `Escape` bilan yopiladi va fokus undan chiqib ketmaydi.
- [ ] Til almashtirilganda `lang` atributi o'zgaradi.
- [ ] Har bir rasmda `alt` bor.
- [ ] Kontrast nisbati o'lchab tekshirilgan.
- [ ] Brauzerning o'rnatilgan tekshiruv vositasi jiddiy xato ko'rsatmaydi.

### Xavfsizlik

- [ ] `_headers` fayli yaratilgan.
- [ ] Lokal yig'ilishda sarlavhalar chiqadi, bu tekshirilgan.
- [ ] CSP avval `Report-Only` rejimida qo'yilgan.
- [ ] CSP yoqilganda sayt buzilmaydi, konsolda buzilish xabari yo'q.
- [ ] Shriftlar, rasmlar va API so'rovlari CSP ostida ishlaydi.
- [ ] API javoblarida himoya sarlavhalari bor.
- [ ] `FRONTEND_URL` bo'sh bo'lganda API xato tashlaydi.

## Chegaralar

Production'ga deploy qilinmaydi.

## Tugatgandan keyin

- `CLAUDE.md` ga yangi qoidalar qo'shilsin. Maxsus imkoniyatlar talabi va
  xavfsizlik sarlavhalari haqida.
- `docs/JOURNAL.md` yangilansin.
- Uchta alohida kommit.
  `feat(search): full text search across the site`
  `feat(a11y): accessibility panel and keyboard navigation`
  `feat(security): security headers and content security policy`
- **Push qilmang.**
