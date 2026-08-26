# Topshiriq 11 — Logotip, 404 sahifasi va huquqiy bandlar

**Ustuvorlik:** 🔴 Namoyishgacha bajarilsin
**Oldingi shart:** 05-demo bilan birga yoki undan keyin

---

# A qism. Institut logotipi

Manba fayl `docs/reference/logo-original.jpg`.

Logotip aylana shaklida, to'q sariq va ko'k ranglarda, markazida chaqmoq belgisi.
Ostida `ENERGETIKA MUAMMOLARI INSTITUTI` yozuvi.

## A1. Fayl sifati bo'yicha ogohlantirish

Berilgan fayl **407 nuqta kenglikda, JPEG formatida, atigi 25 kilobayt**.
Bu sayt uchun kichik. Kattalashtirsa qirralari bulg'anadi, ayniqsa yuqori
aniqlikdagi ekranlarda.

Fayl JPEG bo'lgani uchun **shaffof fon ham yo'q**, ya'ni oq to'rtburchak
sifatida chiqadi. To'q fonda bu darhol ko'zga tashlanadi.

Shuning uchun quyidagilar bajarilsin.

Hozirgi fayldan foydalanib ishlang, chunki namoyish yaqin.

**Ayni paytda foydalanuvchiga so'rov qoldirilsin.** Logotipning vektor
ko'rinishi kerak, ya'ni SVG, AI yoki EPS fayli. Bo'lmasa, kamida 1000 nuqta
kenglikdagi shaffof fonli PNG. Dizayner yoki logotipni yaratgan tashkilotda
bo'lishi mumkin.

## A2. Ishlatilishi

Logotipda ikkita qism bor, emblema va matn. Ular turli joyda alohida kerak.

**Sarlavhada faqat emblema ishlatilsin.** Yozuvli variant emas. Sabab shundaki,
sarlavhada institut nomi allaqachon matn sifatida yozilgan va u tilga qarab
o'zgaradi. Yozuvli logotip qo'yilsa, ingliz va rus tillarida o'zbekcha yozuv
takrorlanib qoladi.

Emblemani ajratish uchun asl fayldan pastki matn qismi kesib olinsin.

**Footerda to'liq logotip** ishlatilishi mumkin.

**Favicon** ham emblemadan tayyorlansin. Kerakli o'lchamlar 32 va 180 nuqta.
Hozirgi standart favicon fayli almashtirilsin.

**Ijtimoiy tarmoq uchun rasm** tayyorlansin, 1200 ga 630 nuqta. Fon institut
rangida, markazida logotip va nom.

## A3. Rang muvofiqligi

Logotipdagi to'q sariq va ko'k ranglar 02-topshiriqda tanlangan akademik navy
va oltin palitradan farq qiladi.

**Palitrani o'zgartirmang.** Logotip o'z ranglarida qoladi, sayt esa o'z
palitrasida. Bu odatiy holat, chunki logotip alohida brend elementi.

Faqat bitta joyda moslashtirish kerak. Sarlavhadagi logotip yonidagi fon
neytral bo'lsin, ya'ni logotip rangi bilan urishmasin.

Agar rahbariyat saytni logotip ranglariga moslashtirishni so'rasa, buni
alohida topshiriq sifatida ko'rib chiqamiz. Hozir o'z bilganingizcha
o'zgartirmang.

---

# B qism. 404 sahifasi

## B1. Hozirgi holat

`App.tsx` da shunday qator bor.

```
<Route path="*" element={<Navigate to="/" replace />} />
```

Ya'ni mavjud bo'lmagan har qanday manzil bosh sahifaga yo'naltiriladi.

Bu ikki jihatdan noto'g'ri. Foydalanuvchi nima bo'lganini tushunmaydi va
o'zini adashgandek his qiladi. Qidiruv tizimlari esa buzilgan havolani
bosh sahifa sifatida indekslaydi va bu SEO ga zarar beradi.

## B2. Bajarilishi kerak

Yangi `NotFoundPage` komponenti yozilsin va u yo'naltirish o'rniga ko'rsatilsin.

Sahifa `PublicLayout` ichida bo'lsin, ya'ni sarlavha va footer o'z joyida
qolsin. Foydalanuvchi adashib qolmaydi.

### Sahifa mazmuni

Yirik `404` raqami yoki mos tasvir.

Sarlavha va qisqa tushuntirish. Matn ayblovchi ohangda bo'lmasin. `Siz
noto'g'ri manzil kiritdingiz` emas, `Bunday sahifa topilmadi` yaxshiroq.

Qidiruv maydoni. 10-topshiriqdagi qidiruv tayyor bo'lsa, u shu yerga ulanadi.
Tayyor bo'lmasa, joyi qoldirilsin.

Asosiy bo'limlarga havolalar. Bosh sahifa, Institut haqida, Yangiliklar,
Bog'lanish.

Admin panel havolasi bu sahifada **ko'rsatilmasin**.

### Uch tillilik

Barcha matnlar `locales/uz.json`, `en.json` va `ru.json` ga qo'shilsin.
Kalitlar `notFound` bo'limida guruhlansin.

Til foydalanuvchining joriy tanloviga qarab aniqlansin. Til tanlanmagan
bo'lsa, o'zbek tili ishlatilsin.

### Sarlavha va belgilash

Sahifa sarlavhasi `Sahifa topilmadi` bo'lsin.

`robots` belgisiga `noindex` qo'yilsin, ya'ni bu sahifa indekslanmasin.

### Admin panel uchun

Admin panel ichidagi mavjud bo'lmagan manzil uchun alohida oddiy sahifa
bo'lsin va u boshqaruv sahifasiga qaytish havolasini ko'rsatsin.

## B3. Server tomoni

Cloudflare Pages'da haqiqiy `404` holat kodini qaytarish uchun `_redirects`
faylida sozlash kerak.

Hozir barcha manzillar `200` kodi bilan `index.html` ga yo'naltiriladi.
Bu SPA uchun zarur, lekin mavjud bo'lmagan sahifa ham `200` qaytaradi.

Bu masala to'liq faqat SSR yoki prerender bilan hal bo'ladi, u esa
11-topshiriqda emas, SEO ishida ko'riladi. Hozircha kodda `TODO` izohi
qoldirilsin va foydalanuvchiga ko'rinadigan qism to'g'ri ishlasin.

---

# C qism. Huquqiy bandlar

Vazirlar Mahkamasining 2021-yil 15-iyundagi 373-son qarori talablari.

## C1. Materiallardan foydalanish sharti

Qarorda majburiy axborotlar ro'yxatida shunday band bor.

> rasmiy veb-saytning axborot materiallaridan foydalanishda unga havolalar
> majburiy ko'rsatilishi to'g'risidagi talab

Footerga qisqa yozuv qo'shilsin. Mazmuni shunday bo'lsin. Sayt materiallaridan
foydalanilganda manba sifatida saytga havola ko'rsatilishi shart.

Uchala tilda yozilsin.

## C2. Axborot manbai

Qarorning 4-bandi.

> Rasmiy veb-saytda boshqa manbalardan axborotlarni joylashtirishga faqat
> axborot manbai ko'rsatilgan taqdirda yo'l qo'yiladi.

Yangilik modeliga `sourceName` va `sourceUrl` maydonlari qo'shilsin.
To'ldirilgan bo'lsa, yangilik oxirida manba ko'rsatilsin.

Admin panelda bu maydonlar yonida qisqa izoh bo'lsin. Boshqa manbadan
olingan material joylashtirilsa, manba ko'rsatilishi shartligi eslatilsin.

**Migratsiya yozing.**

## C3. Yangilanish sanasi

Qarorning 6-bandi axborot sanasi ko'rsatilishini talab qiladi.

Har bir sahifada oxirgi yangilanish sanasi ko'rsatilsin. Yangilik va nashr
sahifalarida bu allaqachon bor. Statik sahifalarda, masalan Institut haqida
va Tuzilma, u yo'q.

Footerda umumiy `Sayt oxirgi yangilangan sana` ko'rsatkichi bo'lsin.
Qiymat bazadagi eng so'nggi o'zgarish vaqtidan olinsin.

## C4. Sana formati

`date-fns` kutubxonasi ishlatiladi, lekin o'zbek tili sozlamasi ulanmagan.
Sanalar hozir noto'g'ri yoki inglizcha formatda chiqishi mumkin.

Har bir til uchun mos sozlama ulansin. O'zbek tili uchun `uz` yoki
`uz-Cyrl` emas, lotin varianti kerak. Kutubxonada mavjud emasligini
tekshiring, bo'lmasa oddiy o'z formatlash funksiyasi yozilsin.

Sana formati `26.08.2026` ko'rinishida bo'lsin, chunki O'zbekistonda shu
shakl qabul qilingan.

---

## Qabul mezonlari

### Logotip

- [ ] Emblema sarlavhada ko'rinadi, sifati qoniqarli.
- [ ] Uchala tilda sarlavhada o'zbekcha yozuv takrorlanmaydi.
- [ ] Favicon almashtirilgan, brauzer yorlig'ida ko'rinadi.
- [ ] Ijtimoiy tarmoq rasmi tayyorlangan.
- [ ] Mobil ko'rinishda logotip to'g'ri joylashadi.
- [ ] Foydalanuvchiga vektor fayl haqida so'rov yozilgan.

### 404

- [ ] Mavjud bo'lmagan manzil bosh sahifaga **yo'naltirilmaydi**.
- [ ] 404 sahifasi sarlavha va footer bilan birga ko'rinadi.
- [ ] Uchala tilda tekshirilgan.
- [ ] Havolalar ishlaydi.
- [ ] `noindex` belgisi qo'yilgan.
- [ ] Admin panel ichidagi noto'g'ri manzil uchun alohida sahifa bor.
- [ ] Mobil kenglikda to'g'ri joylashadi.

### Huquqiy

- [ ] Footerda materiallardan foydalanish sharti uchala tilda yozilgan.
- [ ] Yangilikka manba maydonlari qo'shilgan, migratsiya yozilgan.
- [ ] Manba to'ldirilgan yangilikda u sahifada ko'rinadi.
- [ ] Footerda oxirgi yangilanish sanasi ko'rinadi.
- [ ] Sanalar `26.08.2026` formatida chiqadi, uchala tilda tekshirilgan.

## Tugatgandan keyin

- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(brand): institute logo, 404 page and legal notices`
- **Push qilmang.**
- Foydalanuvchiga so'rov yozilsin. Logotipning vektor fayli va institutning
  brend qo'llanmasi bormi.
