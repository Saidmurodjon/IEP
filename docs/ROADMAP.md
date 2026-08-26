# ROADMAP.md — loyihaning to'liq rejasi

Bu fayl butun ishning xaritasi. `docs/tasks/` dagi topshiriqlar shu rejadan kelib chiqadi.
Yangi topshiriq yozishdan oldin shu fayl o'qiladi va yangilanadi.

---

## ⚠️ AVVAL HAL QILINISHI KERAK BO'LGAN MASALA

Vazirlar Mahkamasining **2021-yil 15-iyundagi 373-son qarori** bilan tasdiqlangan
talablar 8-bandida shunday deyilgan.

> Rasmiy veb-sayt Internet tarmog'idagi «.UZ» domen zonasida va O'zbekiston
> Respublikasining Hukumat portalida belgilangan tartibda ro'yxatdan o'tkazilishi,
> shuningdek **O'zbekiston Respublikasi hududida serverda jismoniy joylashtirilishi
> kerak (xosting)**.

Hozirgi sayt Cloudflare tarmog'ida joylashgan va u O'zbekiston hududida emas.

**Bu talab institutga tegishlimi yoki yo'qmi, aniqlanishi shart.** Qaror matnida
gap `davlat organlari, xo'jalik birlashmalari va mahalliy ijro etuvchi hokimiyati
organlari` haqida ketmoqda. Fanlar akademiyasi ilmiy instituti bularning qaysi
toifasiga kirishi bir qarashda aniq emas.

Javob ikki xil natija beradi.

**Talab tegishli bo'lmasa** hozirgi arxitektura saqlanadi. Server ijarasi yo'q,
xarajat deyarli nolga teng, tezlik yuqori.

**Talab tegishli bo'lsa** butun joylashtirish qismi qayta ko'rib chiqiladi.
Bu holda O'zbekistondagi provayderda server olinadi, API Node.js muhitiga
moslashtiriladi va yillik ijara xarajati paydo bo'ladi. Kodning katta qismi
saqlanadi, lekin Workers'ga xos yechimlar almashtiriladi.

**Buni institut yuriskonsultidan yoki Fanlar akademiyasi huquq bo'limidan
so'rang.** Ish davom etaveradi, lekin domen ulanishi va rasmiy ishga tushirish
shu javobdan keyin qilinsin.

Men yurist emasman va bu masalada yakuniy xulosa chiqara olmayman.
Manba `docs/reference/373-qaror-talablari.md` da saqlangan.

---

## Bajarilgan ishlar

| № | Ish | Holat |
|---|---|---|
| 01 | Admin login, PBKDF2, JWT, rate limiting | ✅ Bajarildi |
| — | Dizayn, akademik palitra, haqiqiy fotolar | ✅ Bajarildi |
| 04 | Rasmiy tuzilma, olti laboratoriya | ✅ Kod tayyor, production kutmoqda |
| — | GitHub Actions deploy quvuri | ✅ Yozildi, sozlanmagan |

## Rejalashtirilgan topshiriqlar

| № | Ish | Holat |
|---|---|---|
| 03 | Production'ga chiqarish | ⏸ Cloudflare kirish kutmoqda |
| 05 | Namoyishga tayyorlash, sozlamalardan keladigan aloqa ma'lumotlari | 📋 Yozildi |
| 06 | Laboratoriya sahifalari, xodimlar, rahbariyat, hamkorlar | 📋 Yozildi |
| 07 | Fayl yuklash, tahrirlagich, moderator qulayligi | 📋 Yozildi |
| 08 | Xatoliklar jurnali | 📋 Yozildi |

---

## Qolgan ishlar

Quyidagilar hali topshiriq sifatida yozilmagan. Ustuvorlik tartibida keltirilgan.

### 09. Majburiy huquqiy talablar

373-son qarorda sanab o'tilgan, hozir saytda yo'q bo'lgan qismlar.

**Imkoniyati cheklangan shaxslar uchun versiya.** Kontrastni oshirish, shriftni
kattalashtirish, sodda ko'rinishga o'tish. Qarorda bu **majburiy** deb belgilangan.
Bundan tashqari klaviatura orqali to'liq boshqarish va ekran o'qigichlar uchun
belgilash kerak.

**Kengaytirilgan qidiruv.** Sayt bo'ylab qidirish va natijalarni bo'lim, sana,
til bo'yicha filtrlash. Bu ham majburiy talab.

**Ishonch telefoni** raqami ko'zga tashlanadigan joyda.

**Bo'sh ish o'rinlari** bo'limi, talablar va murojaat tartibi bilan.

**Tez-tez beriladigan savollar** bo'limi.

**Ochiq ma'lumotlar** bo'limi.

**Matbuot xizmati** ma'lumotlari va mas'ul xodim aloqasi.

**Hukumat portali va tegishli saytlarga havolalar.**

**Kirish yo'llari** haqida ma'lumot, ya'ni jamoat transporti raqamlari va
to'xtash joyi. Bog'lanish sahifasiga qo'shiladi.

**Saytdan foydalanish yo'riqnomasi.**

**Statistika va kirishlar hisobi.** Cloudflare Web Analytics bepul va u
foydalanuvchi ma'lumotini yig'maydi. Bu bizning holatimizga mos keladi.

**Yangiliklarga obuna.** Elektron pochta orqali yangiliklar yuborish.

**Yillik va choraklik hisobotlar** bo'limi. 07-topshiriqdagi `Document` modeli
buni qamrab oladi, faqat alohida turkum kerak.

### 10. Murojaatlar tizimini to'ldirish

Hozir bog'lanish formasi xabarni faqat bazaga yozadi va hech kimga bildirmaydi.
Bu `CLAUDE.md` dagi 6-muammo.

Qarorda esa undan ham ko'proq talab qilinadi. Murojaat holatini kuzatib borish,
ya'ni fuqaro o'z murojaatining qaysi bosqichda ekanini ko'ra olishi va elektron
pochta yoki SMS orqali xabar olishi.

Bajarilishi kerak. Yangi murojaat kelganda belgilangan manzilga xat yuborilsin.
Har bir murojaatga takrorlanmas raqam berilsin. Fuqaro shu raqam orqali holatni
tekshira olsin. Admin panelda murojaat holati o'zgartirilsin, ya'ni qabul qilindi,
ko'rib chiqilmoqda, javob berildi.

Spam himoyasi ham shu yerda qo'shiladi.

### 11. SEO va indekslash

`CLAUDE.md` dagi 7-muammo. Hozir Google indeksida bitta sahifa ko'rinadi.

Har bir sahifa uchun alohida sarlavha va tavsif. Sayt xaritasi fayli va u
avtomatik yangilanishi. Ijtimoiy tarmoq uchun belgilash. Ilmiy tashkilot uchun
tuzilmali ma'lumot belgilash.

Eng muhim qism prerender yoki SSR. Buni qanday qilish hozirgi joylashtirish
masalasi hal bo'lgandan keyin aniqlanadi, chunki yechim muhitga bog'liq.

### 12. Xavfsizlik sarlavhalari va audit

Hozir sayt hech qanday himoya sarlavhasi yubormaydi.

Kontent xavfsizligi siyosati, ya'ni CSP. Ramkaga solishni taqiqlash. Turni
taxmin qilishni o'chirish. HSTS. Yo'naltiruvchi manba siyosati.

Bundan tashqari `npm audit` muntazam tekshirilsin va CI ga qo'shilsin.

### 13. Foydalanuvchi rollari

Hozir bitta `Admin` modeli bor va rol tushunchasi yo'q. Bitta parol butun
saytga to'liq huquq beradi.

Kamida uchta rol kerak. Bosh administrator hamma narsani qila oladi.
Moderator faqat kontent kirita oladi, sozlamalarga tegmaydi. Kuzatuvchi
faqat ko'radi.

Bundan tashqari kim nima o'zgartirgani qayd etilsin. Davlat muassasasida
bu talab qilinishi mumkin.

### 14. Testlar va CI

`CLAUDE.md` dagi 10-muammo. Hozir birorta test yo'q.

08-topshiriqda `redact.ts` uchun birinchi testlar paydo bo'ladi. Undan keyin
parol moduli, JWT moduli va slug hosil qilish uchun testlar yozilsin.

GitHub Actions ga test bosqichi qo'shilsin va testlar yiqilsa deploy to'xtasin.

### 15. Zaxira nusxa va tiklash

Ma'lumotlar bazasi zaxirasi hozir umuman rejalashtirilmagan.

Kamida haftalik zaxira olinsin va u boshqa joyda saqlansin. Tiklash tartibi
hujjatlashtirilsin va **bir marta amalda sinab ko'rilsin**. Sinalmagan zaxira
zaxira hisoblanmaydi.

### 16. Ilmiy bo'limlar

Institut sayti uchun standart, lekin qarorda talab qilinmagan qismlar.

Ilmiy kengash va uning tarkibi. Dissertatsiya himoyalari e'lonlari. Ilmiy
loyihalar va grantlar. Xalqaro hamkorlik. Konferensiyalar va tadbirlar
taqvimi. Foto va videogalereya.

### 17. Kuzatuv va bildirishnoma

Sayt ishlamay qolsa sizga xabar kelsin. Bepul kuzatuv xizmatlari bor va ular
besh daqiqada bir marta tekshiradi.

08-topshiriqdagi jurnal bilan birlashtirilsa, kunlik xulosa xatini yuborish
mumkin bo'ladi.

### 18. Domen va rasmiy ishga tushirish

`iep.uz` domenini ro'yxatdan o'tkazish va ulash. Hukumat portalida ro'yxatga
olish. Rasmiy pochta manzillarini sozlash. Eng oxirida bajariladi, chunki
yuqoridagi huquqiy masala hal bo'lishi kerak.

---

## Ish tartibi bo'yicha qoida

Har bir yangi topshiriq quyidagi shaklda yoziladi.

Muammoning aniq tavsifi va u qayerdan kelib chiqqani. Nima qilish kerakligi.
Tekshirib bo'ladigan qabul mezonlari. Chegaralar, ya'ni nima qilinmasligi kerak.
Tugatgandan keyingi qadamlar.

Topshiriq yozilmasdan ish boshlanmasin. Sababi oddiy. Yozilmagan talab
bajarilganini tekshirib bo'lmaydi.
