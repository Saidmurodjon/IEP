# Topshiriq 07 — Fayl yuklash, matn tahrirlagich va moderator qulayligi

**Ustuvorlik:** 🔴 Yuqori
**Oldingi shart:** 06 bajarilgan bo'lsin
**Bog'liq muammo:** `CLAUDE.md` 5-muammo, fayl yuklash yo'q

---

## Maqsad

Institut xodimi dasturchiga murojaat qilmasdan yangilik yoza olsin, matn ichiga rasm
qo'ya olsin, hujjat va nashr fayllarini yuklay olsin.

Hozir bu mumkin emas. `imageUrl` va `fileUrl` maydonlariga faqat tashqi havola qo'lda
kiritiladi, ya'ni moderator avval faylni boshqa joyga yuklashi kerak. Amalda hech kim
bunday qilmaydi va sayt bo'sh qoladi.

---

## 1. Fayl ombori

`apps/api/wrangler.toml` ga R2 bog'lanishi qo'shilsin.

```
[[r2_buckets]]
binding = "MEDIA"
bucket_name = "energetika-media"
```

`Env` interfeysiga `MEDIA: R2Bucket` qo'shilsin. Bog'lanish yo'q bo'lsa, yuklash
endpointi `503` va `STORAGE_UNAVAILABLE` kodi bilan javob bersin, `lib/env.ts` dagi
yondashuvga o'xshab.

Fayllar `GET /api/files/:key` orqali beriladi. Bu endpoint ochiq, chunki rasmlar
saytda ko'rinishi kerak. Javobga uzoq muddatli `Cache-Control` sarlavhasi qo'yilsin,
chunki kalitlar takrorlanmaydi.

Kalit tasodifiy hosil qilinsin va asl fayl nomiga bog'liq bo'lmasin. Masalan
`2026/08/<uuid>.webp`. Asl nom faqat bazada saqlanadi.

---

## 2. `MediaFile` modeli

Fayllarni kuzatib borish uchun alohida jadval kerak. Busiz tahrirlashda eski faylni
o'chirish va yozuv o'chirilganda omborni tozalash imkonsiz.

| Maydon | Turi | Izoh |
|---|---|---|
| `id` | String | cuid |
| `key` | String | R2 dagi kalit, unikal |
| `originalName` | String | Foydalanuvchi yuklagan nom |
| `mimeType` | String | |
| `size` | Int | Baytlarda |
| `width` `height` | Int? | Faqat rasmlar uchun |
| `ownerType` | String? | `news`, `publication`, `employee`, `partner`, `document` |
| `ownerId` | String? | Tegishli yozuv identifikatori |
| `createdAt` | DateTime | |

`ownerId` bo'sh fayl **egasiz** hisoblanadi. Moderator rasm yukladi, lekin yozuvni
saqlamasdan chiqib ketdi degani. Bunday fayllar 24 soatdan keyin tozalanadi,
buning uchun qo'lda ishga tushiriladigan `POST /api/uploads/cleanup` endpointi
qo'shilsin. Cron keyinroq sozlanadi.

**Migratsiya yozing**, `db push` ishlatmang.

---

## 3. Yuklash endpointi

`POST /api/uploads` qo'shilsin, `requireAuth` bilan himoyalangan.

`multipart/form-data` qabul qiladi. Maydonlar `file` va `kind`.
`kind` qiymatlari `image`, `document`, `photo`.

### Chegaralar

| Turi | Ruxsat etilgan formatlar | Maksimal hajm | O'lcham |
|---|---|---|---|
| `image` | jpeg, png, webp | 5 MB | eng ko'pi 4000 nuqta |
| `photo` | jpeg, png, webp | 2 MB | eng kami 200 nuqta |
| `document` | pdf, doc, docx, xls, xlsx | 20 MB | — |

### Tekshiruv tartibi

Fayl turi **magic bayt**lar bo'yicha aniqlansin. `Content-Type` sarlavhasi va fayl
kengaytmasi mijoz tomonidan yuboriladi va ularga ishonib bo'lmaydi. PDF `%PDF`,
PNG `\x89PNG`, JPEG `\xFF\xD8\xFF`, WebP `RIFF....WEBP` bilan boshlanadi.

SVG **qabul qilinmasin**. SVG ichida skript bo'lishi mumkin va u saqlangan XSS
uchun keng ishlatiladigan yo'l.

Hajm oqim o'qilishidan oldin `Content-Length` bo'yicha ham, o'qish jarayonida ham
tekshirilsin.

Rasm o'lchamlari mijoz tomonida tekshiriladi va serverda faqat magic bayt va hajm
tekshiriladi, chunki Workers muhitida rasm dekodlash kutubxonasi yo'q.

---

## 4. Mijoz tomonida rasmni tayyorlash

Moderator odatda telefonda olingan 8 megabaytlik rasmni yuklaydi. Uni o'sha holicha
yuborish sayt tezligini buzadi.

Yuklashdan oldin brauzerda `canvas` orqali quyidagilar bajarilsin.

Rasm kengligi 1920 nuqtadan katta bo'lsa, nisbatni saqlagan holda kichraytirilsin.
Xodim rasmi uchun chegara 800 nuqta.

Natija `image/webp` formatiga, sifat 0.85 bilan o'girilsin. WebP qo'llab
quvvatlanmasa `image/jpeg` ishlatilsin.

Foydalanuvchiga qisqacha xabar ko'rsatilsin. Masalan
`Rasm 4032 nuqtadan 1920 nuqtaga kichraytirildi, hajmi 7,8 MB dan 412 KB ga tushdi.`

Bu moderatorga nima bo'layotganini tushuntiradi va sayt sekinlashishining oldini oladi.

---

## 5. Matn tahrirlagich

Admin paneldagi `content` maydonlari uchun oddiy matn maydoni yetarli emas.
Moderator kalta HTML yoza olmaydi.

`@tiptap/react` va `@tiptap/starter-kit` qo'shilsin, ustiga `@tiptap/extension-image`
va `@tiptap/extension-link`.

Tahrirlagich **faqat admin panelda** ishlatiladi, shuning uchun `lazy` import
orqali yuklansin. Ochiq sahifalar uning hajmini ko'tarmasligi kerak.

### Talab qilinadigan imkoniyatlar

Qalin va qiya matn, ikkinchi va uchinchi darajali sarlavhalar, belgili va raqamli
ro'yxatlar, havola qo'yish, iqtibos.

**Rasmni to'g'ridan to'g'ri qo'yish.** Moderator rasmni nusxalab `Cmd+V` bosganda
yoki faylni tahrirlagich ustiga sudrab tashlaganda, rasm avtomatik yuklanib matn
ichiga qo'yilsin. Yuklanish davomida joy egallovchi ko'rsatilsin.

**Word dan nusxa ko'chirishni tozalash.** Word va veb sahifadan nusxa ko'chirilganda
juda ko'p keraksiz belgilash keladi. Qo'yish paytida faqat ruxsat etilgan teglar
qoldirilsin.

### Sanitizatsiya

`CLAUDE.md` 7-qoidasi shu paytgacha bajarilmagan. Kontent `dangerouslySetInnerHTML`
bilan chiqariladi va sanitizatsiya yo'q. Moderator ixtiyoriy HTML yuborishi mumkin
bo'lgani uchun bu endi jiddiy xavf.

Serverda saqlashdan oldin HTML tozalansin. Ruxsat etilgan teglar ro'yxati aniq
belgilansin, qolgani olib tashlansin. `script`, `iframe`, `object`, `embed`,
`style` teglari va `on` bilan boshlanadigan barcha atributlar taqiqlansin.
`img` uchun faqat o'z omborimizdagi manzillarga ruxsat berilsin.

Frontendda ham ko'rsatishdan oldin ikkinchi marta tozalansin.

---

## 6. Fayl biriktirish

### Nashrlar

`Publication` yozuvida `fileUrl` o'rniga fayl yuklash tugmasi bo'lsin. Yuklangan
fayl nomi, hajmi va turi ko'rsatilsin. Ochiq sahifada yuklab olish tugmasi
`PDF, 2,4 MB` ko'rinishida hajmni ham ko'rsatsin.

### Hujjatlar

Yangi `Document` modeli qo'shilsin. Me'yoriy hujjatlar, buyruqlar va nizomlar uchun.
Maydonlari `titleUz/En/Ru`, `descriptionUz/En/Ru`, `fileKey`, `documentNumber`,
`documentDate`, `category`, `order`, `isActive`.

Ochiq sahifa `/documents` va admin bo'limi `/admin/documents` qo'shilsin.

### Xodim rasmi

06-topshiriqdagi `photoUrl` maydoni fayl yuklash bilan to'ldirilsin.

### Hamkor logotipi

06-topshiriqdagi `logoUrl` ham fayl yuklash orqali to'ldirilsin.

---

## 7. Fayllarni tozalash

Bu qism ataylab batafsil yozilgan, chunki e'tiborsizlik natijasida ombor keraksiz
fayllar bilan to'lib ketadi va oylik to'lov o'sib boradi.

**Tahrirlashda.** Rasm yoki fayl almashtirilsa, eski fayl R2 dan va `MediaFile`
jadvalidan o'chirilsin.

**Yozuv o'chirilganda.** O'sha yozuvga tegishli barcha `MediaFile` yozuvlari
topilib, R2 dan o'chirilsin.

**Matn ichidagi rasmlar.** Yangilik saqlanayotganda uchala tildagi `content`
maydonidan `/api/files/` bilan boshlanadigan barcha manzillar ajratib olinsin.
Topilgan fayllarning `ownerId` maydoni shu yangilikka o'rnatilsin. Ilgari shu
yangilikka tegishli bo'lgan, lekin endi matnda uchramaydigan fayllar o'chirilsin.

Bu moderator rasmni matndan olib tashlaganda ombor o'z-o'zidan tozalanishini
ta'minlaydi.

**O'chirish amali `CLAUDE.md` 8-qoidasiga zid emas**, chunki bu yerda gap
foydalanuvchi ma'lumotini emas, egasiz qolgan fayllarni tozalash haqida ketmoqda.
Shunga qaramay o'chirish faqat `MediaFile` jadvalida qayd etilgan kalitlar bo'yicha
bajarilsin, ombor bo'ylab ommaviy o'chirish qilinmasin.

---

## 8. Xato va muvaffaqiyat xabarlari

Hozirgi xabarlar inglizcha va noaniq. Moderator uchun bu yaroqsiz.

### Javob shakli

API xatolikda quyidagi shaklda javob qaytarsin.

```
{ "error": { "code": "FILE_TOO_LARGE", "message": "..." } }
```

`code` doimiy va o'zgarmas bo'lsin. `message` texnik xodim uchun inglizcha qoladi
va ichki tafsilotni oshkor qilmaydi, bu `CLAUDE.md` 6-qoidasi.

Foydalanuvchiga ko'rsatiladigan o'zbekcha matn **frontendda** kod bo'yicha
tanlansin va `locales/*.json` da saqlansin.

### Kodlar ro'yxati

| Kod | O'zbekcha xabar |
|---|---|
| `FILE_TOO_LARGE` | Fayl hajmi juda katta. Ruxsat etilgan eng katta hajm {limit}. |
| `UNSUPPORTED_TYPE` | Bu turdagi fayl qabul qilinmaydi. Ruxsat etilgan formatlar {formats}. |
| `IMAGE_TOO_SMALL` | Rasm o'lchami juda kichik. Eng kami {min} nuqta bo'lishi kerak. |
| `IMAGE_TOO_LARGE` | Rasm o'lchami juda katta. Eng ko'pi {max} nuqta bo'lishi kerak. |
| `EMPTY_FILE` | Fayl bo'sh. |
| `STORAGE_UNAVAILABLE` | Fayl ombori vaqtincha ishlamayapti. Keyinroq urinib ko'ring. |
| `UPLOAD_FAILED` | Faylni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring. |
| `VALIDATION_ERROR` | Ma'lumotlar to'liq emas. Qizil bilan belgilangan maydonlarni to'ldiring. |
| `NOT_FOUND` | Yozuv topilmadi. Ehtimol u o'chirilgan. |
| `UNAUTHORIZED` | Sessiya muddati tugadi. Qaytadan kiring. |
| `SERVER_ERROR` | Serverda xatolik. Agar takrorlansa, texnik xodimga murojaat qiling. |

Xato xabari yonida kod kichik shriftda ko'rsatilsin, masalan `FILE_TOO_LARGE`.
Moderator uni texnik xodimga aytishi mumkin bo'ladi.

### Muvaffaqiyat xabarlari

Har bir amaldan keyin qisqa tasdiq ko'rsatilsin.

`Yangilik saqlandi.` `Rasm yuklandi.` `Fayl o'chirildi.` `Xodim qo'shildi.`
`O'zgarishlar saqlandi.`

Xabarlar to'rt soniyadan keyin o'z-o'zidan yo'qolsin, xato xabarlari esa
foydalanuvchi yopgunicha qolsin.

Xabarlar uchun umumiy komponent yozilsin va u butun admin panelda ishlatilsin.
Har bir sahifada alohida yechim yozilmasin.

---

## 9. Moderator qulayligi

### Havola avtomatik hosil bo'lsin

Yangilik sarlavhasi kiritilganda `slug` avtomatik shakllansin. O'zbek harflari
lotin belgilariga o'girilsin, ya'ni `o'` va `g'` dan apostrof olib tashlansin,
bo'shliqlar chiziqchaga aylantirilsin, boshqa belgilar olib tashlansin.

Moderator xohlasa uni qo'lda o'zgartira olsin. Yozuv saqlangandan keyin `slug`
avtomatik o'zgarmasin, chunki eski havolalar buziladi.

Bir xil `slug` mavjud bo'lsa oxiriga raqam qo'shilsin.

### Tarjima maydonlari

Hozir uchala til bir sahifada ketma-ket turadi va shakl juda uzun.

Til bo'yicha yorliqlar qilinsin. O'zbek tili birinchi va sukut bo'yicha ochiq.
Har bir yorliqda to'ldirilgan yoki bo'sh ekani ko'rinib tursin.

`O'zbekchadan nusxa ko'chirish` tugmasi qo'shilsin. Moderator o'zbekcha matnni
kiritib, uni ingliz yorlig'iga ko'chirib, keyin tarjima qilishi mumkin bo'lsin.

### Tarjima talab qilmaydigan maydonlar

Sana, mualliflar, jurnal nomi, yil, DOI, hujjat raqami, rasm va fayl uchala tilda
takrorlanmaydi. Ular shaklda **bir marta**, til yorliqlaridan tashqarida
ko'rsatilsin.

Bu shakl uzunligini sezilarli qisqartiradi va moderatorning eng ko'p uchraydigan
xatosini bartaraf etadi.

### Boshqa qulayliklar

Saqlanmagan o'zgarishlar bo'lgan holda sahifadan chiqishga urinilsa ogohlantirish
chiqsin.

Nashr sanasi sukut bo'yicha bugungi kun bilan to'ldirilsin.

Yangilikni `qoralama` holatida saqlash mumkin bo'lsin va u ochiq sahifada
ko'rinmasin. Nashr etish alohida tugma bilan bajarilsin.

Majburiy maydonlar yulduzcha bilan belgilansin va to'ldirilmagan bo'lsa qizil
ramka hamda maydon ostida o'zbekcha izoh chiqsin.

---

## Qabul mezonlari

- [ ] Migratsiya yozilgan, `db push` ishlatilmagan.
- [ ] `npx tsc --noEmit` va `npm run build` toza.
- [ ] R2 bog'lanishi yo'q holatda yuklash `503` va `STORAGE_UNAVAILABLE` qaytaradi.
- [ ] 5 MB dan katta rasm rad etiladi, kod `FILE_TOO_LARGE`, xabar o'zbekcha.
- [ ] Kengaytmasi `.jpg` ga o'zgartirilgan `.exe` fayl rad etiladi, ya'ni magic bayt
      tekshiruvi ishlaydi. **Bu haqiqiy fayl bilan sinab ko'rilsin.**
- [ ] SVG fayl rad etiladi.
- [ ] Katta rasm brauzerda avtomatik kichraytiriladi va foydalanuvchiga xabar beriladi.
- [ ] Tahrirlagichga rasm `Cmd+V` bilan qo'yiladi va matn ichida ko'rinadi.
- [ ] Word dan nusxa ko'chirilgan matn tozalanadi.
- [ ] `<script>` yozilgan kontent saqlanganda serverda olib tashlanadi.
- [ ] Rasm almashtirilganda eski fayl R2 dan o'chiriladi, bu tekshirilgan.
- [ ] Yangilik o'chirilganda unga tegishli barcha fayllar o'chiriladi.
- [ ] Matndan rasm olib tashlanib saqlansa, o'sha fayl ombordan o'chiriladi.
- [ ] Barcha xato xabarlari o'zbekcha va yonida kod ko'rsatilgan.
- [ ] Muvaffaqiyat xabarlari chiqadi va to'rt soniyada yo'qoladi.
- [ ] Sarlavha yozilganda havola avtomatik hosil bo'ladi, o'zbek harflari to'g'ri o'giriladi.
- [ ] Til yorliqlari ishlaydi, nusxa ko'chirish tugmasi ishlaydi.
- [ ] Tarjima talab qilmaydigan maydonlar shaklda bir marta ko'rinadi.
- [ ] Qoralama ochiq sahifada ko'rinmaydi.
- [ ] Butun jarayon **brauzerda boshidan oxirigacha bajarib ko'rilgan**, ya'ni
      yangilik yaratish, rasm qo'yish, saqlash, tahrirlash, rasmni almashtirish,
      o'chirish va ombor tozalanganini tekshirish.
- [ ] Uchala tilda tekshirilgan.

## Chegaralar

Production'ga deploy qilinmaydi, production bazasiga va production omboriga yozilmaydi.
Lokal sinov uchun `wrangler dev` ning o'rnatilgan R2 taqlidi ishlatilsin.

## Tugatgandan keyin

- `CLAUDE.md` da 5-muammo ✅ ga o'zgartirilsin, 7-qoida bajarilgani qayd etilsin,
  ochiq endpointlar ro'yxatiga `GET /api/files/:key` qo'shilsin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(admin): file uploads, rich text editor and Uzbek feedback messages`
- **Push qilmang.**
