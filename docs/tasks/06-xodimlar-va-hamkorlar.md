# Topshiriq 06 — Laboratoriya sahifalari, xodimlar reyestri va hamkorlar

**Ustuvorlik:** 🟠 Yuqori — namoyishdan oldin
**Oldingi shart:** 05-demo bajarilgan bo'lsin

---

## Maqsad

Uchta yangilik qo'shiladi.

Har bir laboratoriyaning o'z sahifasi bo'ladi va unda faoliyat yo'nalishi hamda xodimlari ko'rsatiladi.

Institut xodimlari reyestri yaratiladi va ular laboratoriyalarga bog'lanadi.

Bosh sahifaning pastida hamkor tashkilotlar logotiplari aylanma lenta ko'rinishida chiqadi.

Xodimlar reyestri namoyish uchun eng qimmatli qism. Institut rahbariyati va olimlari saytda
o'z ismini ko'rsa, loyihaga munosabat butunlay o'zgaradi.

---

## 1. Xodimlar modeli

`schema.prisma` ga `Employee` modeli qo'shilsin.

| Maydon | Turi | Izoh |
|---|---|---|
| `id` | String | cuid |
| `fullNameUz` | String | Xamdamov Saidmurodjon |
| `fullNameEn` | String | Khamdamov Saidmurodjon |
| `fullNameRu` | String | Хамдамов Саидмуроджон |
| `positionUz` `positionEn` `positionRu` | String | Lavozimi |
| `degreeUz` `degreeEn` `degreeRu` | String? | Ilmiy darajasi |
| `titleUz` `titleEn` `titleRu` | String? | Ilmiy unvoni |
| `email` | String? | |
| `phone` | String? | |
| `photoUrl` | String? | |
| `orcid` | String? | ORCID identifikatori |
| `scopusId` | String? | |
| `researchAreaUz` `researchAreaEn` `researchAreaRu` | String? | Ilmiy qiziqish yo'nalishi |
| `officeRoom` | String? | Xona raqami |
| `receptionHoursUz` `receptionHoursEn` `receptionHoursRu` | String? | Qabul kunlari va soatlari |
| `isManagement` | Boolean | Rahbariyat tarkibidami |
| `isUnitHead` | Boolean | Bo'linma yoki laboratoriya mudirimi |
| `unitId` | String? | `StructureUnit` ga havola |
| `order` | Int | Ro'yxatdagi tartibi |
| `isActive` | Boolean | Ishdan ketganda `false` qilinadi, o'chirilmaydi |

### Qabul vaqtlari haqida

Qabul jadvali erkin matn ko'rinishida, uchala tilda saqlanadi. Masalan
`Dushanba va chorshanba kunlari soat 15:00 dan 17:00 gacha`. Tuzilmali shaklga
keltirish shart emas, chunki muassasada jadval buyruq bilan belgilanadi va
uning shakli o'zgarib turishi mumkin.

Maydon bo'sh bo'lsa, sahifada qabul vaqti haqidagi qator umuman ko'rinmasin.

### Shaxsiy ma'lumotlar bo'yicha ogohlantirish

Saytda faqat **xizmat telefoni va xizmat elektron pochtasi** e'lon qilinadi.
Shaxsiy mobil raqam yoki shaxsiy pochta manzili joylashtirilmaydi.

`phone` maydoniga qiymat kiritilayotganda bu qoida admin panelda izoh sifatida
ko'rsatilsin. Ma'lumotni e'lon qilishga xodimning roziligi kerakligi haqida
qisqa eslatma bo'lsin.

Ism uchala tilda alohida saqlanadi, chunki ruscha variant kirill yozuvida yoziladi va uni
avtomatik hosil qilib bo'lmaydi.

`unitId` orqali xodim laboratoriyaga bog'lanadi. `StructureUnit` modeliga teskari bog'lanish
qo'shilsin va u o'chirilganda xodim o'chmasin, `unitId` `null` bo'lsin.

ORCID va Scopus maydonlari ilmiy muassasa sayti uchun muhim. Ular bo'sh bo'lsa sahifada
umuman ko'rinmaydi.

**Migratsiya yozing**, `prisma db push` ishlatmang.

---

## 2. Hamkorlar modeli

`Partner` modeli qo'shilsin.

| Maydon | Turi |
|---|---|
| `id` | String |
| `nameUz` `nameEn` `nameRu` | String |
| `logoUrl` | String |
| `websiteUrl` | String? |
| `order` | Int |
| `isActive` | Boolean |

---

## 3. API

`apps/api/src/routes/` ga ikkita yangi fayl.

`employees.ts` bilan `GET /api/employees` va `GET /api/employees/:id` ochiq bo'ladi.
Ro'yxat `unitId` bo'yicha filtrlanishi mumkin. Yozuv amallari `requireAuth` bilan himoyalanadi.

`partners.ts` bilan `GET /api/partners` ochiq, qolgani himoyalangan.

Ikkalasida ham kiruvchi ma'lumot `zValidator` bilan tekshirilsin.

`index.ts` ga marshrutlar qo'shilsin. `CLAUDE.md` 4-qoidasidagi ochiq endpointlar ro'yxati
yangilansin, chunki ikkita yangi ochiq `GET` paydo bo'ldi.

`apps/web/src/lib/api.ts` ga `employeesApi` va `partnersApi` qo'shilsin.

---

## 4. Laboratoriya sahifasi

Yangi marshrut `/laboratories/:id`. `App.tsx` da `LabsPage` dan keyin joylashtirilsin.

Sahifada quyidagilar bo'ladi.

Laboratoriya nomi va xodimlar soni. Faoliyat yo'nalishi, ya'ni `StructureUnit` dagi
`description` maydoni. Laboratoriya xodimlari kartochkalar ko'rinishida.

**Laboratoriya mudiri alohida ajratib ko'rsatilsin.** `isUnitHead` belgisi qo'yilgan
xodim ro'yxatning boshida, kengaytirilgan kartochkada chiqsin. Unda xona raqami,
xizmat telefoni, xizmat pochtasi va qabul vaqtlari ham bo'ladi. Qolgan xodimlar
oddiy kartochkalarda ko'rsatiladi.

`LabsPage` dagi har bir kartochka shu sahifaga havola qilsin.

### Laboratoriya tavsiflari

Hozir `StructureUnit.description` maydonlari bo'sh. Ularni to'ldirish kerak, lekin
**o'ylab topmang**.

Vazirlar Mahkamasi qarorida institut faoliyatining asosiy yo'nalishlari belgilangan va ular
`docs/tasks/04-kontent.md` ning 3-bo'limida keltirilgan. Har bir laboratoriya uchun shu
ro'yxatdan mos keladigan bir yoki ikkita yo'nalish tanlab, laboratoriya nomi bilan
bog'lanadigan qisqa tavsif yozilsin. Ikki uch jumladan oshmasin.

Har bir tavsif ostiga kodda `TODO: institut tasdiqlashi kerak` izohi qoldirilsin va
tayyor bo'lgach foydalanuvchiga ro'yxat berilsin.

Aniq loyihalar, natijalar, grantlar, hamkorlar va sanalarni yozmang. Ular hujjatda yo'q.

---

## 4a. Rahbariyat sahifasi

Yangi ochiq sahifa `/management`. Bosh menyuda `Institut haqida` yonida joylashsin.

Sahifada `isManagement` belgisi qo'yilgan xodimlar `order` bo'yicha chiqadi. Tartib
tuzilma hujjatiga mos bo'lsin, ya'ni direktor, ilm-fan bo'yicha o'rinbosar, umumiy
masalalar bo'yicha o'rinbosar, ilmiy kotib.

Har bir rahbar uchun kengaytirilgan kartochka bo'ladi. Unda rasm, ism, lavozim,
ilmiy daraja va unvon, xona raqami, xizmat telefoni, xizmat pochtasi va
**qabul kunlari** ko'rsatiladi.

Qabul vaqti ko'zga tashlanadigan qilib ajratilsin, masalan yengil fon va soat
ikonkasi bilan. Fuqarolar saytga aynan shu ma'lumot uchun kiradi.

Ma'lumoti to'ldirilmagan maydon umuman ko'rinmasin. Bo'sh joy yoki chiziqcha qolmasin.

## 5. Xodimlar sahifasi

Yangi ochiq sahifa `/employees`. Bosh menyuga qo'shilsin.

Xodimlar laboratoriyalar bo'yicha guruhlansin. Har bir guruh sarlavhasi laboratoriya nomi.
Rahbariyat alohida birinchi guruh sifatida chiqsin.

Har bir kartochkada rasm, ism, lavozim, ilmiy daraja va unvon bo'ladi.
`photoUrl` bo'sh bo'lsa, ism bosh harflaridan tashkil topgan doira ko'rsatilsin.
Rasm o'rniga bo'sh joy qolmasin.

Elektron pochta, ORCID va Scopus havolalari mavjud bo'lgandagina ko'rsatilsin.

---

## 6. Hamkorlar lentasi

Bosh sahifaning eng pastida, CTA bo'limidan keyin joylashsin.

Logotiplar gorizontal yo'nalishda uzluksiz siljib tursin. Sichqoncha ustiga kelganda
to'xtasin. Havolasi bor hamkor logotipi bosilganda yangi oynada ochilsin.

**Tashqi kutubxona qo'shmang.** `CLAUDE.md` 14-qoidasiga muvofiq faqat Tailwind va CSS
animatsiyasi ishlatilsin. Uzluksiz harakat uchun logotiplar ro'yxati ikki marta takrorlanadi
va butun lenta bir xil tezlikda siljitiladi.

`prefers-reduced-motion` sozlamasi yoqilgan foydalanuvchida animatsiya to'xtatilsin va
logotiplar oddiy setka ko'rinishida chiqsin.

Hamkorlar ro'yxati bo'sh bo'lsa, butun bo'lim ko'rinmasin.

### Logotiplar haqida ogohlantirish

Hamkor tashkilot logotipi uning savdo belgisi hisoblanadi. Saytga faqat institut bilan
**haqiqatan hamkorlik qiladigan** tashkilotlar logotipi qo'yiladi.

Logotiplarni internetdan izlab topmang va o'zingiz tanlamang. Ular institut tomonidan
taqdim etiladi. Ro'yxat kelmaguncha bo'lim bo'sh qolsin.

Fayllar vaqtincha `apps/web/public/images/partners/` papkasida saqlansin. Fayl yuklash
imkoniyati R2 orqali keyinroq qo'shiladi, bu `CLAUDE.md` dagi 5-muammo.

---

## 7. Admin panel

Ikkita yangi bo'lim qo'shilsin, ikkalasi ham `ProtectedRoute` ichida.

`/admin/employees` orqali xodim qo'shish, tahrirlash, laboratoriyaga biriktirish va
tartibini o'zgartirish mumkin bo'lsin. Ishdan ketgan xodim o'chirilmasin, `isActive`
belgisi olib tashlansin.

`/admin/partners` orqali hamkor qo'shish va tartibini o'zgartirish mumkin bo'lsin.

`AdminLayout` menyusiga ikkala bo'lim qo'shilsin.

---

## 8. Tarjimalar

Barcha yangi matnlar `locales/uz.json`, `en.json` va `ru.json` ga qo'shilsin.
Uchala fayl bir xil kalitlarga ega bo'lishi tekshirilsin, birortasi qolib ketmasin.

---

## Qabul mezonlari

- [ ] Migratsiya yozilgan, `db push` ishlatilmagan.
- [ ] `npx tsc --noEmit` — api va web da toza.
- [ ] `npm run build` — ikkala app.
- [ ] `GET /api/employees` va `GET /api/partners` ishlaydi, yozuv amallari `401` qaytaradi.
- [ ] `/laboratories/:id` ochiladi, tavsif va xodimlar ko'rinadi.
- [ ] `LabsPage` dagi kartochkalar shu sahifaga olib boradi.
- [ ] `/management` sahifasi ochiladi, rahbariyat tuzilma hujjatidagi tartibda chiqadi.
- [ ] Qabul kunlari rahbariyat kartochkasida ko'zga tashlanadigan holda ajratilgan.
- [ ] Laboratoriya sahifasida mudir alohida, kengaytirilgan kartochkada birinchi turadi.
- [ ] Qabul vaqti yoki telefon to'ldirilmagan bo'lsa, o'sha qator umuman ko'rinmaydi,
      bo'sh joy yoki chiziqcha qolmaydi.
- [ ] Admin panelda telefon maydoni yonida shaxsiy raqam e'lon qilinmasligi haqida izoh bor.
- [ ] `/employees` sahifasi laboratoriyalar bo'yicha guruhlangan.
- [ ] Rasmsiz xodim kartochkasi bosh harflar bilan chiroyli ko'rinadi.
- [ ] Hamkorlar lentasi siljiydi, sichqoncha ustida to'xtaydi.
- [ ] `prefers-reduced-motion` yoqilganda animatsiya yo'q, setka ko'rinadi.
- [ ] Hamkorlar ro'yxati bo'sh bo'lganda bo'lim umuman ko'rinmaydi.
- [ ] Admin panelda xodim qo'shish **brauzerda boshidan oxirigacha bajarib ko'rilgan** va
      u ochiq sahifada paydo bo'lgan.
- [ ] Uchala tilda tekshirilgan, ko'rinib qolgan tarjima kaliti yo'q.
- [ ] Mobil kenglikda (375px) barcha yangi sahifalar to'g'ri joylashadi.
- [ ] Hech qanday soxta ism, tashkilot yoki logotip qo'shilmagan.

## Chegaralar

Production'ga deploy qilinmaydi, production bazasiga yozilmaydi.
Haqiqiy shaxs ismlari, tashkilot nomlari va logotiplar o'ylab topilmaydi, ular
foydalanuvchi tomonidan taqdim etiladi.

## Tugatgandan keyin

- `CLAUDE.md` dagi ochiq endpointlar ro'yxati va tuzilma tavsifi yangilansin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(content): employee registry, lab pages and partners carousel`
- **Push qilmang.**
- Foydalanuvchiga aniq ro'yxat berilsin. Qaysi xodimlarning ismi, lavozimi, ilmiy darajasi
  va rasmi kerak. Qaysi hamkor tashkilotlar va ularning logotiplari kerak.
