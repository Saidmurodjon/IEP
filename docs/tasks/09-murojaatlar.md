# Topshiriq 09 — Murojaatlar tizimi va elektron xat yuborish

**Ustuvorlik:** 🔴 Yuqori
**Bog'liq muammo:** `CLAUDE.md` 6-muammo
**Huquqiy asos:** Vazirlar Mahkamasining 2021-yil 15-iyundagi 373-son qarori, 11-band

---

## Muammo

Bog'lanish formasi xabarni bazaga yozadi va shu bilan tugaydi.

Fuqaro xabar yuboradi va uning yetib borgani haqida hech qanday tasdiq olmaydi.
Institut xodimi esa yangi murojaat kelganini bilmaydi, chunki hech kimga xabar
bormaydi. Amalda murojaat javobsiz qoladi.

Qarorning 11-bandida esa bundan ham ko'proq talab qilinadi.

> fuqarolar murojaatlarining ko'rib chiqilishi holati va vaqtini kuzatib borish,
> shu jumladan elektron pochtaga va/yoki arizachining mobil telefoniga
> bildirishnomalar yuborish

---

## 1. Model o'zgarishlari

`ContactMessage` modeliga quyidagilar qo'shilsin.

| Maydon | Turi | Izoh |
|---|---|---|
| `ticketNumber` | String | Takrorlanmas raqam, masalan `M-2026-0042` |
| `status` | String | `new`, `in_review`, `answered`, `closed` |
| `statusChangedAt` | DateTime | |
| `answeredAt` | DateTime? | |
| `answerNote` | String? | Ichki izoh, fuqaroga ko'rinmaydi |
| `notifiedAt` | DateTime? | Tasdiq xati yuborilgan vaqt |

`ticketNumber` bo'yicha unikal indeks.

Raqam formati `M-YYYY-NNNN`. Yil boshida hisob noldan boshlanadi.
Raqam ketma-ket bo'lsin, chunki fuqaro uni telefonda aytishi kerak bo'ladi.

Hozirgi `read` maydoni `status` bilan almashtirilsin. Migratsiyada mavjud
yozuvlar `read` qiymatiga qarab `new` yoki `in_review` holatiga o'tkazilsin.

**Migratsiya yozing**, `db push` ishlatmang.

---

## 2. Resend orqali xat yuborish

Xat yuborish uchun Resend xizmati ishlatiladi. U oddiy HTTP so'rov orqali ishlaydi
va Cloudflare Workers muhitiga to'g'ri keladi, chunki SMTP kutubxonasi talab qilmaydi.

`apps/api/src/lib/mail.ts` yozilsin. Unda bitta funksiya bo'lsin va u
qabul qiluvchi, mavzu va matnni oladi.

API kaliti `RESEND_API_KEY` secret'i orqali beriladi. `lib/env.ts` dagi yondashuv
saqlanadi, ya'ni **default qiymat bo'lmaydi**.

Kalit o'rnatilmagan bo'lsa, xat yuborish jimgina o'tkazib yuborilsin va bu holat
08-topshiriqdagi jurnalga `warning` darajasida yozilsin. **Murojaatning o'zi
baribir saqlansin.** Xat yuborilmagani uchun fuqaroning murojaati yo'qolmasligi kerak.

### Muhim cheklov

Resend'da o'z domeningizdan xat yuborish uchun **domen tasdiqlangan bo'lishi shart**.
Bu DNS yozuvlarini qo'shishni talab qiladi va `iep.uz` ulanmaguncha bajarib bo'lmaydi.

Shu sababli `MAIL_FROM` sozlamasi alohida secret sifatida chiqarilsin. Domen
tayyor bo'lgach faqat shu qiymat o'zgartiriladi va kod tegilmaydi.

Sinov bosqichida Resend'ning sinov manzili ishlatilishi mumkin, lekin u faqat
hisob egasining pochtasiga xat yuboradi. Buni kodga izoh sifatida yozing.

Bepul tarif chegaralarini `resend.com` da tekshiring, ular vaqt o'tishi bilan
o'zgaradi.

---

## 3. Yuboriladigan xatlar

### Fuqaroga tasdiq xati

Murojaat saqlangandan darhol keyin yuboriladi.

Mavzusi `Murojaatingiz qabul qilindi`. Matnida murojaat raqami, qabul qilingan
sana va holatni tekshirish uchun havola bo'lsin.

**Xat matnida murojaatning o'zi takrorlanmasin.** Pochta qutisi buzilgan bo'lsa,
shaxsiy ma'lumot uchinchi shaxsga tushib qolmasligi kerak.

### Institut xodimiga bildirishnoma

Yangi murojaat kelganda sozlamalarda ko'rsatilgan manzilga yuboriladi.

Matnida murojaat raqami, mavzusi va admin paneldagi havola bo'lsin.
Fuqaroning telefon raqami va to'liq matni xatga qo'shilmasin, ular admin panelda
ko'riladi.

Qabul qiluvchi manzil sozlamalardan olinsin, kodga yozilmasin.

### Holat o'zgargandagi xabar

Murojaat `answered` holatiga o'tkazilganda fuqaroga xat yuboriladi.

Mavzusi `Murojaatingiz ko'rib chiqildi`. Matnida raqam va holatni tekshirish
havolasi bo'lsin.

Barcha xatlar **o'zbek tilida** yoziladi. Matnlar `locales` da emas, alohida
shablon faylida saqlansin, chunki ular serverda hosil qilinadi.

---

## 4. Holatni tekshirish

Ochiq sahifa `/appeal-status` qo'shilsin.

Fuqaro murojaat raqamini va o'zi ko'rsatgan elektron pochta manzilini kiritadi.
Ikkalasi mos kelsagina holat ko'rsatiladi.

**Faqat raqam bo'yicha tekshirishga ruxsat berilmasin.** Raqamlar ketma-ket
bo'lgani uchun begona odam boshqalarning murojaatlarini ko'rib chiqa oladi.

Javobda faqat holat, qabul qilingan sana va oxirgi o'zgarish sanasi ko'rsatilsin.
Murojaat matni va shaxsiy ma'lumot qaytarilmasin.

Bu endpoint ham cheklovga olinsin, bitta IP uchun daqiqasiga beshtadan ko'p
so'rov qabul qilinmasin.

---

## 5. Spam himoyasi

Ochiq forma spam robotlari uchun ochiq nishon.

Ko'rinmas maydon qo'shilsin. Odam uni to'ldirmaydi, robot to'ldiradi.
To'ldirilgan bo'lsa, murojaat jimgina rad etilsin va foydalanuvchiga
muvaffaqiyat xabari ko'rsatilsin. Robot rad etilganini bilmasligi kerak.

Forma ochilgan vaqt yozib olinsin. Uch soniyadan tez yuborilgan murojaat
rad etilsin.

Bitta IP uchun soatiga uchtadan ko'p murojaat qabul qilinmasin.

Bir xil matn takroran yuborilsa, yangi yozuv yaratilmasin.

---

## 6. Admin paneldagi murojaatlar bo'limi

Mavjud `/admin/messages` sahifasi kengaytirilsin.

Ro'yxatda murojaat raqami, mavzusi, holati va kelgan sanasi ko'rinsin.
Holat bo'yicha filtr bo'lsin. Yangi murojaatlar ajratib ko'rsatilsin.

Murojaatni ochganda to'liq matn, aloqa ma'lumotlari va holatni o'zgartirish
tugmalari bo'lsin.

Holat `answered` ga o'tkazilganda xat yuborilishi haqida ogohlantirish chiqsin
va tasdiq so'ralsin. Tasodifan bosib qo'yish natijasida fuqaroga noto'g'ri
xat ketmasligi kerak.

Boshqaruv sahifasida javobsiz murojaatlar soni ko'rsatilsin.

---

## 7. Saqlash muddati

Murojaatlar shaxsiy ma'lumot o'z ichiga oladi.

Yopilgan murojaatlar bir yildan keyin arxivlansin yoki o'chirilsin. Aniq muddat
institut hujjat aylanishi qoidalariga bog'liq, shuning uchun uni sozlamalarga
chiqaring va kodda `TODO` izohi qoldiring.

Bu masalani institut yuriskonsultidan aniqlashtirish kerak.

---

## Qabul mezonlari

- [ ] Migratsiya yozilgan, mavjud yozuvlar to'g'ri ko'chirilgan.
- [ ] `npx tsc --noEmit` va `npm run build` toza.
- [ ] Murojaat yuborilganda takrorlanmas raqam beriladi va u ekranda ko'rsatiladi.
- [ ] `RESEND_API_KEY` yo'q bo'lganda murojaat baribir saqlanadi, xato jurnalga
      `warning` sifatida tushadi, foydalanuvchi xato ko'rmaydi.
- [ ] Kalit mavjud bo'lganda fuqaroga tasdiq xati yetib boradi, bu **haqiqiy
      pochta manzili bilan sinab ko'rilgan**.
- [ ] Institut manziliga bildirishnoma yetib boradi.
- [ ] Tasdiq xatida murojaat matni takrorlanmaydi.
- [ ] `/appeal-status` faqat raqam va pochta manzili mos kelganda holat ko'rsatadi.
- [ ] Faqat raqam bilan boshqa odamning murojaatini ko'rib bo'lmaydi.
- [ ] Ko'rinmas maydon to'ldirilganda murojaat rad etiladi, lekin foydalanuvchi
      muvaffaqiyat xabarini ko'radi.
- [ ] Bitta IP dan soatiga to'rtinchi murojaat rad etiladi.
- [ ] Holat `answered` ga o'tkazilganda tasdiq so'raladi va xat yuboriladi.
- [ ] Barcha xatlar o'zbek tilida va ularda shaxsiy ma'lumot ortiqcha takrorlanmaydi.
- [ ] Uchala tilda tekshirilgan.

## Chegaralar

Production'ga deploy qilinmaydi. Haqiqiy fuqarolarga sinov xatlari yuborilmaydi,
faqat o'z pochtangizga.

## Tugatgandan keyin

- `CLAUDE.md` da 6-muammo ✅ ga o'zgartirilsin, ochiq endpointlar ro'yxatiga
  `GET /api/contact/status` qo'shilsin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(contact): appeal tracking with email notifications`
- **Push qilmang.**
