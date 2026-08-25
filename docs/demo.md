# Namoyish qo'llanmasi

Institut rahbariyatiga saytni **lokal muhitda** ko'rsatish tartibi.
Production'ga hech narsa deploy qilinmaydi, production bazasiga yozilmaydi.

---

## 1. Namoyishdan oldin (bir marta, ~5 daqiqa)

```bash
# 1. Bog'liqliklar va Prisma client
npm install
npm run db:generate

# 2. Lokal bazani tayyorlash (rasmiy tuzilma + sozlamalar)
npm run db:migrate
npm run db:seed

# 3. Namoyish yangiliklari (FAQAT lokal baza — production'ga hech qachon emas)
npm run db:demo
```

Talab qilinadigan muhit o'zgaruvchilari:

| Fayl | Kalitlar |
|---|---|
| `.env` (ildizda) | `DATABASE_URL` (**lokal** Postgres), `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `VITE_API_URL=http://localhost:3000` |
| `apps/api/.dev.vars` | `DATABASE_URL` (**lokal** Postgres), `JWT_SECRET`, `FRONTEND_URL=http://localhost:5173` |

### ⚠️ Eng muhim shart — lokal ma'lumotlar bazasi

`npm run demo` API'ni `wrangler dev` da ishga tushiradi va u `DATABASE_URL` ni
**`apps/api/.dev.vars` dan** oladi (ildizdagi `.env` dan emas).

**Hozir `.dev.vars` dagi `DATABASE_URL` production Neon bazasiga qaragan.** Shu holatda
namoyish qilinsa:

- saytda production'dagi eski demo ma'lumotlar ko'rinadi (tekshirilmagan manzil,
  o'ylab topilgan yangiliklar);
- namoyish paytida admin panel orqali qo'shilgan har bir yozuv **to'g'ridan-to'g'ri
  production bazasiga yoziladi**.

Namoyishdan oldin lokal Postgres o'rnatilib, `.env` va `.dev.vars` dagi `DATABASE_URL`
o'sha lokal bazaga qaratilishi **shart**:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/energetika"
```

`npm run db:demo` lokal bo'lmagan `DATABASE_URL` bilan **ataylab xato beradi** —
namoyish kontenti production bazasiga tushib qolmasligi uchun. Agar shu xatoni
ko'rsangiz, `DATABASE_URL` hali production'ga qaragan.

---

## 2. Namoyish kuni — bitta buyruq

```bash
npm run demo
```

Bu buyruq:
1. `apps/web` ni **production rejimida yig'adi** (dev rejimi sekin, konsolda ogohlantirish chiqaradi);
2. API'ni `wrangler dev` da ishga tushiradi — `http://localhost:3000` (haqiqiy Workers runtime);
3. Yig'ilgan saytni `vite preview` bilan ochadi — `http://localhost:5173`.

Port 5173 ataylab tanlangan: API'ning CORS ro'yxatida aynan shu manzil bor.

Ochiladigan manzil: **http://localhost:5173**

Boshlashdan oldin brauzerda tekshiring: bosh sahifa ochiladi, yangiliklar ko'rinadi,
`http://localhost:3000/api/settings` javob qaytaradi.

---

## 3. Ko'rsatish tartibi (jami ~5 daqiqa)

| # | Qadam | Vaqt | Nima aytiladi |
|---|---|---|---|
| 1 | **Bosh sahifa** | 40 s | Hero, institut haqida blok, raqamlar: 6 laboratoriya, 18 ilmiy xodim, 29 umumiy xodim |
| 2 | **Til almashtirish** | 30 s | Yuqori o'ng burchakdagi tugma: uz → en → ru. Sahifa to'liq tarjima bo'ladi |
| 3 | **Tuzilma sahifasi** | 60 s | Rasmiy hujjat bilan yonma-yon solishtiriladi: FA Prezidiumining 2025-yil 27-fevraldagi 12-son qarori, 10-ilova. 17 birlik, 6 laboratoriya, Ilmiy kengash — maslahat organi |
| 4 | **Mobil ko'rinish** | 30 s | Brauzer DevTools → 375px. Menyu, kartochkalar, footer joyiga tushadi |
| 5 | **Admin: yangilik qo'shish** | 90 s | `/admin` → login → Yangiliklar → yangi yozuv (3 tilda) → Saqlash |
| 6 | **Yangilik ochiq saytda** | 20 s | Yangi tabda `/news` — qo'shilgan yangilik darhol ko'rinadi |
| 7 | **Sozlamalar: telefon** | 40 s | Admin → Sozlamalar → `phone` maydoniga raqam → Saqlash → ochiq saytda header, footer va Aloqa sahifasida telefon **paydo bo'ladi** |

**7-qadam alohida ta'kidlanadi:** aloqa ma'lumotlari kodda emas, bazada.
Telefon raqami hali tasdiqlanmagani uchun hozir bo'sh va sayt uni **umuman ko'rsatmaydi** —
noto'g'ri raqam ko'rsatishdan ko'ra ko'rsatmaslik afzal. Raqam aniqlangach admin
paneldan kiritiladi, kod o'zgartirilmaydi.

### Ataylab bo'sh qoldirilgan joylar

- **Ilmiy nashrlar** — soxta nashr kiritilmagan. Sahifa "ro'yxat to'ldirilmoqda"
  holatini ko'rsatadi. Institut o'z nashrlarini kiritishi kerak.
- **Bo'linma rahbarlari** — ism-sharif hujjatda yo'q, o'ylab topilmagan.
- **Telefon va ish vaqti** — tasdiqlanmagan.

---

## 4. Nosozlik chiqsa

| Belgi | Sabab | Yechim |
|---|---|---|
| Sahifa ochiladi, lekin yangiliklar/tuzilma bo'sh | API ishlamayapti | Boshqa terminalda: `npm run dev:workers --workspace=apps/api` |
| Konsolda CORS xatosi | Sayt 5173 dan boshqa portda ochilgan | `npm run demo` ni qayta ishga tushiring, manzil aniq `http://localhost:5173` bo'lsin |
| `/api/structure` 500 qaytaradi | Migratsiya qo'llanmagan (`staffCount`, `isAdvisory` ustunlari yo'q) | `npm run db:migrate` |
| Admin login ishlamayapti | `ADMIN_PASSWORD` o'zgargan yoki seed eski | `npm run db:seed` (parol `.env` dagi `ADMIN_PASSWORD` dan olinadi) |
| Saytda notanish eski yangiliklar/manzil | API production bazasiga ulangan | `apps/api/.dev.vars` dagi `DATABASE_URL` ni lokal bazaga o'zgartiring, `npm run demo` ni qayta ishga tushiring |
| Header/footer'da aloqa ma'lumoti yo'q | `/api/settings` javob bermayapti | `curl http://localhost:3000/api/settings` bilan tekshiring |
| Port band (`EADDRINUSE`) | Oldingi jarayon o'chmagan | `lsof -ti:5173 \| xargs kill` va `lsof -ti:3000 \| xargs kill` |

**Zaxira reja:** hamma narsa to'xtasa, `npm run dev` (vite dev + bun API) ham ishlaydi,
faqat sekinroq va konsolda ogohlantirishlar bo'ladi.

---

## 5. Namoyishdan keyin

`npm run db:seed` sozlamalarni qayta yozadi — namoyish paytida admin paneldan
kiritilgan telefon raqami o'chib ketadi. Kiritilgan qiymatni saqlab qolish kerak
bo'lsa, namoyishdan keyin seed'ni qayta ishga tushirmang.
