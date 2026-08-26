# Topshiriq 03 — Tuzatilgan auth'ni production'ga chiqarish

**Ustuvorlik:** 🔴 Kritik — 01-topshiriqdan keyin darhol
**Tegishli:** Cloudflare Workers secret'lari, Neon production bazasi, `wrangler deploy`

---

## Kontekst

01-topshiriq kodni tuzatdi, lekin **production hali eski kod bilan ishlayapti**:

- Deploy qilinmagan — Worker'da hali eski, buzuq `auth.ts` turibdi.
- Production bazasidagi admin yozuvida hali eski **bcrypt** hash bor.
- Yangi kod fail-closed: `JWT_SECRET` yo'q bo'lsa login `500` qaytaradi (avval fallback yashirib turardi).

Ya'ni deploy'ni noto'g'ri tartibda qilsak, sayt hozirgidan battar bo'ladi.

---

## ⛔ Ikki bosqichli tartib — buni buzmang

Bu topshiriq **production'ga yozadi**. Shuning uchun ikki bosqichga bo'lingan.

### 1-BOSQICH — faqat diagnostika (hech narsa yozilmaydi)

Quyidagilarni **o'qish uchun** bajaring va natijani hisobot qiling:

1. `cd apps/api && npx wrangler secret list`
   Qaysi secret'lar o'rnatilgan: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`?
2. Loyiha ildizidagi `.env` da nima bor — `DATABASE_URL` production Neon bazasigami yoki lokalga?
   **Qiymatlarni chiqarmang**, faqat "bor / yo'q" va qaysi hostga qarashli ekanini ayting.
3. Hozirgi live API holati:
   ```
   curl -s https://energetika-api.saidmurodjon1020.workers.dev/
   curl -s -o /dev/null -w "%{http_code}\n" -X POST \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@energetika.uz","password":"Admin123!"}' \
     https://energetika-api.saidmurodjon1020.workers.dev/api/auth/login
   ```
4. `npm run build --workspace=apps/api` (`wrangler deploy --dry-run`) — bundle yig'iladimi?
   **Bu 01-topshiriqning tekshirilmagan mezoni edi**, natijasini aniq yozing.

**Keyin TO'XTANG.** Hisobotni bering va tasdiq kuting. 2-bosqichga o'z bilganingizcha o'tmang.

### 2-BOSQICH — faqat tasdiqdan keyin

Tartib muhim: **avval secret, keyin baza, keyin deploy.** Boshqa tartibda sayt vaqtincha buziladi.

1. **`JWT_SECRET`** — yo'q yoki 32 belgidan qisqa bo'lsa:
   ```
   openssl rand -base64 32 | npx wrangler secret put JWT_SECRET
   ```
2. **`FRONTEND_URL`** — o'rnatilmagan bo'lsa CORS faqat `localhost:5173` ga ruxsat beradi va
   brauzerdan kelgan so'rovlar bloklanadi (`index.ts` 37-qator). Qiymat:
   `https://energetika-institute.pages.dev`
3. **Production bazasini qayta seed qilish** — admin paroli yangi PBKDF2 formatiga o'tsin:
   ```
   ADMIN_PASSWORD='<kuchli parol>' DATABASE_URL='<production Neon URL>' npm run db:seed
   ```
   Seed faqat `upsert` ishlatadi (`admin`, `structureUnit`, `news`, `siteSetting`) — hech narsa
   o'chirilmaydi. Lekin seed qilinadigan demo yozuvlar ustiga yoziladi, shuni bilib turing.
   Parolni menga chatda yubormang — men uni `.env` ga o'zim yozaman.
4. **Deploy:**
   ```
   cd apps/api && npx wrangler deploy
   ```

---

## Deploy'dan keyingi tekshiruv — majburiy

Har birini **haqiqiy HTTP so'rov bilan** bajaring:

- [ ] `GET /` → `200`, `{"status":"ok"}`.
- [ ] `GET /api/news`, `/api/publications`, `/api/structure`, `/api/settings` → `200`
      (bu `PrismaNeonHTTP` o'zgarishi production'da ham ishlayotganini tasdiqlaydi).
- [ ] `POST /api/auth/login` to'g'ri parol bilan → `200`, token qaytadi.
- [ ] Noto'g'ri parol → `401`, xabar `Invalid credentials`.
- [ ] Mavjud bo'lmagan email → `401`, **xuddi shu** xabar.
- [ ] 6-urinish → `429`.
- [ ] `GET /api/auth/me` token bilan → `200`.
- [ ] Token oxiri o'zgartirilsa → `401`.
- [ ] **Brauzerda** `https://energetika-institute.pages.dev/admin/login` → kirish ishlaydi,
      Dashboard ochiladi. Konsolda CORS xatosi yo'q.
- [ ] Bosh sahifada yangiliklar va nashrlar ko'rinadi (CORS to'g'ri sozlanganini tasdiqlaydi).

Biror mezon bajarilmasa — **darhol to'xtab, xabar bering.** O'zingiz "tuzatib" ketmang.

---

## Muvaffaqiyat mezoni

Institut xodimi brauzerdan `/admin/login` orqali kirib, yangilik qo'sha oladi.
Shu paytgacha bu **hech qachon mumkin bo'lmagan**.

## Tugatgandan keyin

- `CLAUDE.md` "Ma'lum muammolar" jadvalini yangilang (agar biror qator o'zgargan bo'lsa).
- `docs/JOURNAL.md` — "HOZIRGI HOLAT" ni yangilang va yangi yozuv qo'shing:
  qaysi secret'lar o'rnatildi (qiymatsiz), seed qilindimi, deploy ID, qaysi testlar o'tdi.
- Kommit: `chore(deploy): roll out PBKDF2 auth to production`
- **Push qilmang.**
