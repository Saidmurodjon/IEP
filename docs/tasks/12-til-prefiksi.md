# Topshiriq 12 — Manzillarga til prefiksini kiritish

**Ustuvorlik:** 🔴 Yuqori, boshqa sahifalar qo'shilishidan oldin
**Navbat:** 05 dan keyin, 11 va 06 dan oldin

---

## Nima uchun hozir

Hozir uchala til bir xil manzilda ishlaydi va til brauzer xotirasida saqlanadi.
Bundan uchta muammo kelib chiqadi.

Qidiruv tizimlari faqat bitta versiyani ko'radi. Rus va ingliz tillaridagi
kontent internetda amalda mavjud emas.

Havolani muayyan tilda ulashib bo'lmaydi. Chet ellik hamkorga inglizcha sahifa
yuborilsa, u o'zbekcha ochiladi.

Keyin o'zgartirish qimmatga tushadi. Sayt ishga tushib sahifalar indekslangandan
keyin manzillarni o'zgartirish barcha havolalarni buzadi.

**Shuning uchun bu ish 06, 07 va boshqa yangi sahifalar qo'shilishidan oldin
bajariladi.** Har bir yangi sahifa keyingi ko'chirishni qimmatlashtiradi.

---

## Qabul qilingan qaror

To'liq simmetriya tanlandi. Uchala til ham prefiksli bo'ladi.

```
/                    →  /uz/ ga yo'naltiriladi
/uz/                 bosh sahifa, o'zbekcha
/ru/                 bosh sahifa, ruscha
/en/                 bosh sahifa, inglizcha
/uz/news             yangiliklar
/uz/news/:slug       yangilik sahifasi
/admin/...           prefikssiz, o'zgarmaydi
```

Yangilik manzilidagi `slug` **bitta** bo'lib qoladi va uchala tilda bir xil
ishlatiladi. Har tilga alohida slug qilinmaydi.

---

## 1. Marshrutlash

`App.tsx` da ochiq marshrutlar `/:lang` parametri ostiga olinsin.

`lang` qiymati faqat `uz`, `ru`, `en` bo'lishi mumkin. Boshqa qiymat kelsa,
404 sahifasi ko'rsatilsin. **Bosh sahifaga yo'naltirilmasin**, chunki
`/uzbekistan` kabi manzil xato bo'lsa, foydalanuvchi buni bilishi kerak.

`/` manzili `/uz/` ga yo'naltirilsin.

Admin marshrutlari prefikssiz qoladi. `/admin/login`, `/admin/dashboard`
va boshqalar o'zgarmaydi.

### Eski manzillar

Eski prefikssiz manzillar hech qayerda indekslanmagan va ularga havola yo'q.
**Ular uchun alohida yo'naltirish ro'yxati yozilmasin.**

Prefikssiz kelgan har qanday manzil umumiy qoida bo'yicha `/uz/` bilan
boshlanadigan variantiga yo'naltirilsin. Bitta oddiy qoida yetarli, jadval
kerak emas.

---

## 2. Til holati manbai

Hozir til `localStorage` da saqlanadi va manzil bilan bog'liq emas.

**Endi manzil asosiy manba bo'lsin.** `localStorage` faqat foydalanuvchi
saytga birinchi marta prefikssiz kirganda qaysi tilga yo'naltirishni hal
qilish uchun ishlatilsin.

Manzildagi til `i18next` ga uzatilsin. Ikkalasi doim mos bo'lishi kerak.

Til almashtirilganda **joriy sahifada qolgan holda** prefiks o'zgarsin.
Masalan `/uz/laboratories/lab-renewable` sahifasida ruschaga o'tilsa,
`/ru/laboratories/lab-renewable` ochilsin. Bosh sahifaga qaytarilmasin.

---

## 3. Ichki havolalar

Bu qismda eng ko'p xato bo'ladi, shuning uchun batafsil yozilgan.

Loyihada `<Link to="/news">` ko'rinishidagi havolalar ko'p. Ular prefiksni
hisobga olmaydi va til yo'qoladi.

Yechim. `useLocalizedPath` nomli yordamchi yozilsin. U joriy tilni oladi va
manzilga prefiks qo'shadi.

Yoki `Link` ustiga o'ralgan `LocalizedLink` komponenti yozilsin va butun
loyihada oddiy `Link` o'rniga shu ishlatilsin.

**Ikkinchi yo'l afzal**, chunki keyinchalik oddiy `Link` ishlatilgan joyni
qidirib topish oson bo'ladi.

Barcha ochiq sahifalardagi havolalar ko'chirilsin. Sarlavha, footer, yangilik
kartochkalari, tuzilma daraxti, laboratoriya kartochkalari, xato sahifalari.

Dastur ichida `navigate('/news')` ko'rinishidagi chaqiruvlar ham tekshirilsin.

`grep` bilan qolib ketgan joy yo'qligi tasdiqlansin.

---

## 4. Sahifa belgilashi

`react-helmet-async` allaqachon loyihada bor, undan foydalaniladi.

Har bir sahifada quyidagilar bo'lsin.

`html` elementining `lang` atributi joriy tilga mos bo'lsin. Til
almashtirilganda u ham o'zgarsin.

`canonical` havolasi joriy tildagi to'liq manzilga ishora qilsin.

`hreflang` havolalari uchala til uchun berilsin, ustiga `x-default`
qo'shilsin va u o'zbekcha versiyaga ishora qilsin.

Misol tariqasida `/uz/news` sahifasida shunday bo'ladi.

```
<link rel="canonical" href="https://iep.uz/uz/news" />
<link rel="alternate" hreflang="uz" href="https://iep.uz/uz/news" />
<link rel="alternate" hreflang="ru" href="https://iep.uz/ru/news" />
<link rel="alternate" hreflang="en" href="https://iep.uz/en/news" />
<link rel="alternate" hreflang="x-default" href="https://iep.uz/uz/news" />
```

Asosiy manzil sozlamalardan olinsin, kodga yozilmasin. Hozircha vaqtinchalik
manzil ishlatiladi, domen ulangach o'zgaradi.

---

## 5. Til aniqlash

Foydalanuvchi `/` manziliga kirganda qaysi tilga yo'naltirilishi shu tartibda
aniqlansin.

Avval `localStorage` dagi oldingi tanlov qaralsin.

Bo'lmasa brauzer tili qaralsin. `Accept-Language` yoki `navigator.language`
qiymati `ru` bilan boshlansa ruschaga, `en` bilan boshlansa inglizchaga.

Boshqa holatda o'zbekchaga.

**Qidiruv robotlari uchun bu yo'naltirish muammo tug'dirmasligi kerak.**
Yo'naltirish doimiy emas, vaqtinchalik bo'lsin, ya'ni `302` mantiqiga mos
kelsin. Sababi shundaki, `/` manzili har xil foydalanuvchi uchun har xil
tilga olib boradi.

---

## 6. Sayt xaritasi uchun tayyorgarlik

Sayt xaritasi SEO topshirig'ida yoziladi, lekin unga tayyorgarlik shu yerda
qilinsin.

Barcha ochiq sahifalar ro'yxati bitta joyda, kodda saqlansin. Har bir sahifa
uchun manzil naqshi va u uchala tilda mavjudligi belgilansin.

Bu ro'yxat keyinchalik sayt xaritasi hosil qilish uchun ishlatiladi va
marshrutlar bilan sinxron qoladi.

---

## Qabul mezonlari

- [ ] `npx tsc --noEmit` va `npm run build` toza.
- [ ] `/` manzili tilga qarab `/uz/`, `/ru/` yoki `/en/` ga yo'naltiradi.
- [ ] `/uz/news`, `/ru/news`, `/en/news` uchalasi ham ochiladi va **mos
      tildagi kontentni** ko'rsatadi.
- [ ] `/xx/news` kabi noto'g'ri til uchun 404 chiqadi, bosh sahifaga
      yo'naltirilmaydi.
- [ ] Til almashtirilganda foydalanuvchi **joriy sahifada qoladi**, bosh
      sahifaga qaytarilmaydi. Ichki sahifada tekshirilgan.
- [ ] Prefikssiz manzil umumiy qoida bo'yicha `/uz/` ga yo'naltiriladi.
- [ ] `grep -rn "to=\"/" apps/web/src` natijasida prefikssiz qolgan ichki
      havola yo'q, admin marshrutlaridan tashqari.
- [ ] `navigate(` chaqiruvlari ham tekshirilgan.
- [ ] `html` elementidagi `lang` atributi tilga mos va til almashtirilganda
      o'zgaradi, bu brauzerda tekshirilgan.
- [ ] Har bir sahifada `canonical` va uchta `hreflang` havolasi bor,
      ustiga `x-default` qo'shilgan.
- [ ] Admin marshrutlari o'zgarmagan, `/admin/login` ishlaydi.
- [ ] Admin panelga kirish va yangilik qo'shish jarayoni buzilmagan.
- [ ] Sahifani yangilaganda til saqlanadi.
- [ ] Havolani nusxalab boshqa brauzerda ochganda o'sha tilda ochiladi.
      **Bu haqiqatan sinab ko'rilgan.**

## Chegaralar

Production'ga deploy qilinmaydi. Sayt xaritasi va boshqa SEO ishlari bu
topshiriqqa kirmaydi, faqat tayyorgarlik qilinadi.

## Tugatgandan keyin

- `CLAUDE.md` ga qoida qo'shilsin. Barcha ochiq sahifa havolalari
  `LocalizedLink` orqali yozilsin, oddiy `Link` ishlatilmasin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `refactor(i18n): language prefixed routes with hreflang`
- **Push qilmang.**
