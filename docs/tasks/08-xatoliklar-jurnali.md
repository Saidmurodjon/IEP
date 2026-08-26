# Topshiriq 08 — Xatoliklarni qayd etish tizimi

**Ustuvorlik:** 🟠 Yuqori
**Oldingi shart:** 07 bajarilgan bo'lsin

---

## Muammo

Hozir saytda yuz beradigan xatolik hech qayerda saqlanmaydi.

Server tomonida `console.error` ishlatiladi, lekin Cloudflare Workers'da bu chiqishlar
faqat `wrangler tail` ochiq turganda ko'rinadi. Ular saqlanmaydi va keyin qaraladigan
tarix qolmaydi.

Foydalanuvchi tomonida esa umuman hech narsa yo'q. JavaScript xatosi yuz bersa sahifa
oq bo'lib qoladi va bu haqda hech kim bilmaydi.

Amalda bu shunday ko'rinadi. Moderator qo'ng'iroq qilib "sayt ishlamayapti" deydi.
Sizda esa qachon, qaysi sahifada, qanday xato bo'lgani haqida hech qanday ma'lumot yo'q.

---

## 1. `ErrorLog` modeli

| Maydon | Turi | Izoh |
|---|---|---|
| `id` | String | cuid |
| `fingerprint` | String | Bir xil xatolarni guruhlash uchun |
| `source` | String | `server` yoki `client` |
| `level` | String | `error`, `warning`, `info` |
| `code` | String? | 07-topshiriqdagi xato kodi |
| `message` | String | Xato matni |
| `stack` | String? | Chaqiruvlar zanjiri, qisqartirilgan |
| `path` | String? | Qaysi sahifa yoki endpoint |
| `method` | String? | HTTP usuli |
| `statusCode` | Int? | |
| `userAgent` | String? | |
| `adminId` | String? | Tizimga kirgan xodim, agar bo'lsa |
| `count` | Int | Necha marta takrorlangan |
| `firstSeenAt` | DateTime | |
| `lastSeenAt` | DateTime | |
| `isResolved` | Boolean | Hal qilingan deb belgilangan |
| `note` | String? | Texnik xodimning izohi |

`fingerprint` bo'yicha unikal indeks bo'lsin.

**Migratsiya yozing**, `db push` ishlatmang.

---

## 2. Takrorlanishlarni guruhlash

Bu eng muhim qism. Busiz bitta takrorlanuvchi xato bazani bir kechada to'ldirib qo'yadi.

Har bir xato uchun barmoq izi hisoblansin. U xato matni, chaqiruvlar zanjirining
birinchi qatori va yo'l birikmasidan olingan qisqa xesh bo'lsin.

Xuddi shunday barmoq izi allaqachon mavjud bo'lsa, yangi qator yaratilmasin.
`count` bittaga oshirilsin va `lastSeenAt` yangilansin.

Bir xil barmoq izi uchun yozuv daqiqasiga bir martadan ko'p yangilanmasin.
Ya'ni xato soniyasiga yuz marta takrorlansa ham, bazaga bir daqiqada bitta
yozish amali bajariladi.

Yozuvlar soni umumiy chegaradan oshsa, eng eski hal qilingan yozuvlar o'chirilsin.

---

## 3. Shaxsiy ma'lumotlarni yashirish

Bu davlat muassasasi sayti. Jurnalga tushgan ma'lumot ham himoyalanishi kerak.

Quyidagilar **hech qachon** yozilmasin.

Parollar va parol hashlari. JWT tokenlar va `Authorization` sarlavhasi.
`Cookie` sarlavhasi. Bog'lanish formasidan kelgan xabar matni va telefon raqami.
Ma'lumotlar bazasi ulanish satri.

Elektron pochta manzili jurnalga to'liq yozilmasin. Uning o'rniga niqoblangan
shakl saqlansin, masalan `s***@academy.uz`.

So'rov tanasi umuman saqlanmasin. Faqat maydonlar nomlari qoldirilishi mumkin,
qiymatlari emas.

Yozishdan oldin barcha ma'lumot bitta funksiyadan o'tkazilsin va u yuqoridagi
kalitlarni topib o'rniga `[yashirilgan]` qo'ysin. Funksiya `apps/api/src/lib/redact.ts`
da bo'lsin va unga birlik sinovlari yozilsin.

---

## 4. Server tomonida qayd etish

`apps/api/src/index.ts` ga umumiy xato ushlagich qo'shilsin. Hono'ning `onError`
imkoniyati ishlatilsin.

Ushlangan har bir xato jurnalga yoziladi va foydalanuvchiga 07-topshiriqdagi
`SERVER_ERROR` kodi qaytariladi. Ichki tafsilot chiqarilmaydi.

Quyidagi holatlar alohida qayd etilsin.

Ma'lumotlar bazasiga ulanib bo'lmagani. R2 omboriga murojaat muvaffaqiyatsiz
tugagani. `JWT_SECRET` yoki boshqa sozlama yo'qligi. Login urinishlari chegaradan
oshgani, bu xavfsizlik hodisasi. Yaroqsiz token bilan murojaat.

**Muhim.** Jurnalga yozish amali asosiy so'rovni bloklamasin. Yozish
`c.executionCtx.waitUntil()` orqali fonda bajarilsin, aks holda xato yuz berganda
javob yanada sekinlashadi.

**Yozishning o'zi xato bersa, u qayta qayd etilmasin.** Aks holda cheksiz halqa
hosil bo'ladi. Bunday holatda faqat `console.error` ishlatilsin.

---

## 5. Foydalanuvchi tomonida qayd etish

### React xato chegarasi

Hozir ilovada xato chegarasi umuman yo'q. Bitta komponentdagi xato butun sahifani
oqartirib qo'yadi.

`ErrorBoundary` komponenti yozilsin va `App.tsx` da butun ilovani o'rab olsin.
Admin panel uchun alohida chegara bo'lsin, ya'ni admin paneldagi xato ochiq
sahifalarni yiqitmasin.

Xato yuz berganda foydalanuvchiga o'zbekcha sahifa ko'rsatilsin. Unda qisqacha
tushuntirish, sahifani yangilash tugmasi va bosh sahifaga qaytish havolasi bo'lsin.
Texnik tafsilot ko'rsatilmasin, faqat qisqa hodisa raqami chiqsin.

### Global tutuvchilar

`window.onerror` va `unhandledrejection` hodisalariga obuna bo'linsin.

`api.ts` dagi javob ushlagichida `5xx` javoblar va tarmoq uzilishlari qayd etilsin.
`4xx` javoblar qayd etilmasin, chunki ular odatda foydalanuvchi xatosi.

### Yuborish tartibi

Xatolar `POST /api/logs/client` orqali yuborilsin. Bu endpoint ochiq bo'lishi kerak,
chunki xato tizimga kirmagan foydalanuvchida ham yuz beradi.

Ochiq bo'lgani uchun **suiiste'moldan himoyalansin**. Bitta IP uchun daqiqasiga
o'ntadan ko'p yozuv qabul qilinmasin. Xabar uzunligi cheklansin. Kiruvchi ma'lumot
`zValidator` bilan tekshirilsin.

Xatolar darhol emas, to'plamda yuborilsin. Besh soniyada bir marta yoki sahifa
yopilayotganda yuborilsin, buning uchun `navigator.sendBeacon` ishlatilsin.

Bitta seansda yuboriladigan xatolar soni cheklansin, masalan yigirmata. Halqaga
tushgan sahifa serverni ko'mib tashlamasligi kerak.

---

## 6. Admin paneldagi jurnal bo'limi

Yangi sahifa `/admin/logs`, `ProtectedRoute` ichida.

Ro'yxatda barmoq izi bo'yicha guruhlangan xatolar chiqsin. Har bir qatorda xato
matni, manbai, necha marta takrorlangani, birinchi va oxirgi ko'rilgan vaqti.

Saralash sukut bo'yicha oxirgi ko'rilgan vaqt bo'yicha.

Filtrlar bo'lsin. Manbai, daraja, hal qilinganmi yoki yo'q, sana oralig'i.

Qatorni ochganda to'liq ma'lumot ko'rinsin, shu jumladan chaqiruvlar zanjiri.

Xatoni hal qilingan deb belgilash va izoh yozish mumkin bo'lsin.

Boshqaruv sahifasida so'nggi yigirma to'rt soatdagi hal qilinmagan xatolar soni
ko'rsatilsin. Nol bo'lmasa, u ko'zga tashlanadigan rangda chiqsin.

---

## 7. Endpointlar

`GET /api/logs` ro'yxat, filtrlar va sahifalash bilan, `requireAuth`.
`GET /api/logs/:id` bitta yozuv, `requireAuth`.
`PATCH /api/logs/:id` hal qilingan belgisi va izoh, `requireAuth`.
`DELETE /api/logs/:id` yozuvni o'chirish, `requireAuth`.
`POST /api/logs/client` ochiq, cheklovlar bilan.
`POST /api/logs/cleanup` eski yozuvlarni tozalash, `requireAuth`.

`CLAUDE.md` 4-qoidasidagi ochiq endpointlar ro'yxatiga `POST /api/logs/client`
qo'shilsin va uning nega ochiq ekani izohlansin.

---

## 8. Saqlash muddati

Hal qilingan yozuvlar o'ttiz kundan keyin o'chirilsin.
Hal qilinmagan yozuvlar to'qson kundan keyin o'chirilsin.

Tozalash hozircha qo'lda ishga tushiriladigan endpoint orqali bajarilsin.
Cron keyinroq sozlanadi, kodda `TODO` izohi qoldirilsin.

---

## Qabul mezonlari

- [ ] Migratsiya yozilgan, `db push` ishlatilmagan.
- [ ] `npx tsc --noEmit` va `npm run build` toza.
- [ ] Serverda ataylab xato hosil qilinganda jurnalga yozuv tushadi, bu tekshirilgan.
- [ ] Xuddi shu xato o'n marta takrorlanganda **bitta** yozuv qoladi va `count` o'nga teng.
- [ ] Bir xil xato bir daqiqada ko'p marta yuz bersa, bazaga bitta yozish bajariladi.
- [ ] `redact.ts` uchun birlik sinovlari yozilgan va ular o'tadi.
- [ ] Parol, token va `Authorization` sarlavhasi jurnalda **yo'q**, bu haqiqiy
      xato hosil qilib tekshirilgan.
- [ ] Elektron pochta niqoblangan shaklda saqlanadi.
- [ ] React komponentida ataylab xato hosil qilinganda oq sahifa emas, o'zbekcha
      xato sahifasi chiqadi.
- [ ] Admin paneldagi xato ochiq sahifalarni yiqitmaydi.
- [ ] `window.onerror` orqali ushlangan xato serverga yetib boradi.
- [ ] `POST /api/logs/client` ga daqiqasiga o'ntadan ko'p so'rov yuborilsa `429` qaytadi.
- [ ] Jurnalga yozish amali xato bersa, cheksiz halqa hosil bo'lmaydi.
- [ ] `/admin/logs` sahifasi ochiladi, filtrlar ishlaydi, hal qilingan deb
      belgilash ishlaydi.
- [ ] Boshqaruv sahifasida hal qilinmagan xatolar soni ko'rinadi.
- [ ] Barcha foydalanuvchiga ko'rinadigan matnlar o'zbekcha va uchala tilda mavjud.

## Chegaralar

Production'ga deploy qilinmaydi, production bazasiga yozilmaydi.
Tashqi xato kuzatish xizmati ulanmaydi. Sababi shundaki, davlat muassasasi
ma'lumotini uchinchi tomon serveriga yuborish alohida kelishuvni talab qiladi.

## Tugatgandan keyin

- `CLAUDE.md` da ochiq endpointlar ro'yxati yangilansin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(observability): error logging with grouping and redaction`
- **Push qilmang.**
