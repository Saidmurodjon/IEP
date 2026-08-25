# Topshiriq 05 — Saytni namoyish uchun tayyorlash

**Ustuvorlik:** 🔴 Yuqori — rahbariyatga namoyish qilishdan oldin
**Muhit:** faqat lokal. Production'ga hech narsa deploy qilinmaydi, production bazasiga yozilmaydi.

---

## Maqsad

Sayt institut rahbariyatiga lokal muhitda namoyish qilinadi. Namoyishdan keyin sayt rasmiy
manzilga chiqariladi. Shu sababli hozirgi vazifa saytni **ishonchli va tugallangan** ko'rinishga
keltirish, deploy qilish emas.

Namoyishning hal qiluvchi lahzasi shu. Admin panelga kirib, yangilik qo'shiladi, saqlanadi va
ochiq sahifada darhol paydo bo'lganini ko'rsatiladi. Butun tayyorgarlik shu lahza xatosiz
o'tishiga xizmat qiladi.

---

## 1. Eng jiddiy muammo — soxta aloqa ma'lumotlari

Hozir uchta faylda aloqa ma'lumotlari **kodga qattiq yozib qo'yilgan** va ular haqiqiy emas.

| Fayl | Qatorlar | Nima yozilgan |
|---|---|---|
| `components/layout/Header.tsx` | 41, 44 | `+998 71 262-00-00`, `info@energetika.uz` |
| `components/layout/Footer.tsx` | 64, 68, 74 | `Mirzo Ulug'bek tumani`, telefon, pochta |
| `pages/public/ContactPage.tsx` | 69, 79, 90 | manzil, telefon, pochta |

Ikkita xato bor. Birinchidan, bu qiymatlar demo ma'lumot va haqiqatga mos kelmasligi mumkin.
Rahbariyat noto'g'ri manzilni ko'rsa, butun ishga bo'lgan ishonch shu zahoti pasayadi.
Ikkinchidan, `CLAUDE.md` 11 va 12 qoidalari buzilgan, chunki bu ma'lumotlar `/api/settings`
orqali kelishi kerak edi.

### Bajarilishi kerak

Uchala fayldan qattiq yozilgan qiymatlar olib tashlansin. Ular `settingsApi.all()` orqali
olinsin va sahifada shundan chiqarilsin.

Sozlamalar hali yuklanmagan bo'lsa, joyi bo'sh qolsin yoki yengil yuklanish holati ko'rsatilsin.
Eski qiymatni zaxira sifatida qoldirmang, aks holda noto'g'ri ma'lumot yana ko'rinadi.

So'rov takrorlanmasligi uchun sozlamalar bir marta olinib, umumiy holatda saqlansin.
`@tanstack/react-query` allaqachon loyihada bor, undan foydalaning.

Natijada telefon yoki manzilni admin panelining Sozlamalar bo'limidan o'zgartirish mumkin
bo'ladi va o'zgarish saytda darhol aks etadi. Bu namoyishda alohida ko'rsatiladigan imkoniyat.

### Seed'dagi qiymatlar yangilansin

Foydalanuvchi haqiqiy ma'lumotlarni taqdim etdi. `packages/db/src/seed.ts` dagi
`settings` massivida quyidagilar almashtirilsin.

| Kalit | Yangi qiymat |
|---|---|
| `address_uz` | Toshkent shahri, Mirzo Ulug'bek tumani, Do'rmon yo'li ko'chasi, 40-uy |
| `address_en` | 40 Dormon Yoli Street, Mirzo Ulugbek district, Tashkent |
| `address_ru` | г. Ташкент, Мирзо-Улугбекский район, ул. Дурмон йули, 40 |
| `email` | energy@academy.uz |

**Telefon raqami hali noma'lum.** `phone` kaliti bo'sh satr qilib qo'yilsin.
Hozirgi `+998 71 262-00-00` qiymati tekshirilmagan, uni qoldirmang.

Frontend `phone` bo'sh bo'lganda telefon qatorini umuman ko'rsatmasin. Bo'sh joy
noto'g'ri raqamdan yaxshiroq. Raqam aniqlangach admin panel orqali kiritiladi.

**Bulardan boshqa hech qanday qiymat o'ylab topmang.** Ish vaqti, ijtimoiy tarmoq
havolalari va shunga o'xshash ma'lumotlar tasdiqlanmagan bo'lsa, bo'sh qoldirilsin.

---

## 2. Namoyish uchun kontent

### Yangiliklar

Bazada kamida uchta yangilik bo'lsin, aks holda bosh sahifa va Yangiliklar bo'limi bo'sh ko'rinadi.

**Ismlar, sanalar va voqealarni o'ylab topmang.** Faqat hujjat bilan tasdiqlangan yoki
neytral mavzulardan foydalaning. Masalan institut tuzilmasi tasdiqlangani, rasmiy sayt ishga
tushirilgani, laboratoriyalar faoliyati yo'nalishlari haqida umumiy ma'lumot.

Har bir yangilik uchala tilda to'ldirilsin. Rasm maydoni bo'sh qolsa ham kartochka to'g'ri
ko'rinadi, chunki 02-topshiriqda joy egallovchi qo'shilgan.

Yangiliklar seed'ga emas, alohida `packages/db/src/demo-content.ts` fayliga yozilsin va u
faqat qo'lda ishga tushirilsin. Sabab shuki, bu ma'lumot production'ga hech qachon tushmasligi kerak.

### Ilmiy nashrlar

Hozir seed nashrlarni umuman yozmaydi, production bazasida esa mavjud bo'lmagan mualliflar
nomidan yozilgan demo nashrlar turibdi.

Lokal bazaga **soxta nashr kiritmang**. Buning o'rniga Nashrlar sahifasining bo'sh holati
tekshirilsin va u chiroyli ko'rinsin. Bo'sh sahifa soxta ma'lumotdan yaxshiroq.

Namoyish paytida bu bo'lim ataylab bo'sh qoladi va institut o'z nashrlarini kiritishi
kerakligi aytiladi.

---

## 3. Ichki sahifalarni tekshirish

Har bir ochiq sahifa uchala tilda ochilsin va quyidagilar tekshirilsin.

Aralash tildagi matn qolmagan. Jurnalda `AboutPage` da o'zbek va ingliz matni aralash
ekani qayd etilgan, shu tuzatilsin.

Tarjima kaliti topilmay `about.title` ko'rinishida chiqib qolgan joy yo'q.

Bo'sh bo'lim yoki "ma'lumot yo'q" yozuvi bilan to'lgan sahifa yo'q.

Konsolda xato yo'q.

---

## 4. Namoyish rejimini tayyorlash

Dev rejimi sekin ishlaydi va konsolda ogohlantirishlar chiqadi. Namoyish uchun
**production yig'ilishi** ishlatiladi.

```
npm run build --workspace=apps/web
npm run preview --workspace=apps/web
```

API `wrangler dev` da ishga tushirilsin, chunki u Workers muhitini aynan takrorlaydi.

Ikkalasini bitta buyruq bilan ishga tushiradigan `npm run demo` skripti qo'shilsin.
Namoyish kunida bitta buyruq yetarli bo'lishi kerak.

Yig'ilgan versiyada `VITE_API_URL` lokal API manziliga ishora qilishi tekshirilsin.

---

## 5. Namoyish qo'llanmasi

`docs/demo.md` fayli yaratilsin. Ichida quyidagilar bo'lsin.

Namoyishdan oldin bajariladigan buyruqlar ketma-ketligi.

Ko'rsatish tartibi. Bosh sahifa, til almashtirish, Tuzilma sahifasi rasmiy hujjat bilan
solishtirish, mobil ko'rinish, admin panelda yangilik qo'shish, o'sha yangilikni ochiq
sahifada ko'rsatish, Sozlamalar bo'limida telefon raqamini o'zgartirib ko'rsatish.

Har bir qadam uchun taxminiy vaqt. Umumiy davomiylik besh daqiqadan oshmasin.

Nosozlik chiqqan taqdirda nima qilish. Masalan API javob bermasa qaysi buyruq bilan
qayta ishga tushiriladi.

---

## Qabul mezonlari

- [ ] `npx tsc --noEmit` — api va web da toza.
- [ ] `npm run build` — ikkala app muvaffaqiyatli yig'iladi.
- [ ] `grep -rn "998 71 262" apps/web/src` natijasi bo'sh, ya'ni qattiq yozilgan telefon yo'q.
- [ ] Header, Footer va ContactPage'dagi aloqa ma'lumotlari `/api/settings` dan keladi.
- [ ] Manzil va elektron pochta haqiqiy qiymatlarga almashtirilgan, uchala tilda.
- [ ] `phone` bo'sh, va bo'sh bo'lganda telefon qatori sahifada umuman ko'rinmaydi.
- [ ] `grep -rn "262-00-00" apps packages` natijasi bo'sh.
- [ ] Admin panelda telefon raqami o'zgartirilganda saytda aks etadi, bu amalda tekshirilgan.
- [ ] Lokal bazada kamida uchta yangilik bor va uchalasi ham uch tilda to'liq.
- [ ] Nashrlar sahifasining bo'sh holati chiroyli ko'rinadi, soxta nashr kiritilmagan.
- [ ] Yetti ochiq sahifa uchala tilda ochiladi, aralash til va ko'rinib qolgan tarjima kaliti yo'q.
- [ ] Konsolda xato yo'q, bu brauzerda tekshirilgan.
- [ ] Mobil kenglikda (375px) barcha sahifalar to'g'ri joylashadi.
- [ ] `npm run demo` bitta buyruq bilan ikkala qismni ishga tushiradi.
- [ ] Admin panelda yangilik qo'shish va uni ochiq sahifada ko'rish **boshidan oxirigacha
      brauzerda bajarib ko'rilgan**, faqat kodni o'qib emas.
- [ ] `docs/demo.md` yozilgan.

## Chegaralar

Production'ga deploy qilinmaydi. Production bazasiga yozilmaydi. `wrangler deploy` ishlatilmaydi.
Haqiqiy shaxs ismlari, sanalar va ilmiy natijalar o'ylab topilmaydi.

## Tugatgandan keyin

- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(demo): settings-driven contacts and demo readiness`
- **Push qilmang.**
