# 17 — Murojaat xatlarini hostingning o'z pochtasi (SMTP) orqali yuborish

**Holat:** 🕓 rejada — keyingi versiyada (foydalanuvchi qarori, 2026-10-28). Hali boshlanmagan.

## Nega

Hozir `apps/api/src/lib/mail.ts` faqat Resend HTTP API'sini chaqiradi (`RESEND_API_KEY`).
API endi webname'da Node.js'da ishlaydi, shuning uchun xatni hostingning pochta serveri
(Exim, DirectAdmin) orqali SMTP bilan yuborish mumkin: tashqi xizmat va kalit kerak emas,
xat to'g'ridan-to'g'ri `@iep.uz` dan ketadi.

## Tekshirilgan (2026-10-28)

- `info@iep.uz` DirectAdmin'da ochilgan; kiruvchi (Gmail → info@iep.uz) va chiquvchi
  (info@iep.uz → Gmail) ishlaydi, chiquvchi xat Gmail **Inbox** ga tushdi.
- DNS: MX `10 mail.iep.uz` ✅, SPF `v=spf1 a mx ip4:95.46.96.12 ~all` ✅,
  DKIM (`x._domainkey`) ❌ yo'q, DMARC (`_dmarc`) ❌ yo'q.

## Bajarish kerak

1. **Foydalanuvchi (DNS):** DirectAdmin → E-mail Manager → DKIM Keys — iep.uz uchun yoqish;
   DNS Management → TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:info@iep.uz`.
   Keyin `dig TXT x._domainkey.iep.uz` / `_dmarc.iep.uz` bilan tekshirish.
2. **Foydalanuvchi:** `noreply@iep.uz` qutisi (yoki `info@iep.uz` ishlatiladi — qaror kerak).
   Yuborish limitini (soatiga nechta xat) webname'dan so'rash.
3. **Kod:** `mail.ts` ga SMTP transporti (`nodemailer`) — `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS`
   sozlangan bo'lsa SMTP, aks holda Resend (Workers varianti buzilmasin; nodemailer faqat Node
   kirish nuqtasida yuklansin, Workers bundle'iga tushmasin). Env o'zgaruvchilar `lib/env.ts`
   orqali, parol `redact.ts` dan o'tsin, jurnalga tushmasin.
4. **Tekshiruv:** tsc, vitest, `wrangler deploy --dry-run`, `build:node`; lokalda haqiqiy SMTP
   bilan murojaat yuborib Gmail va Mail.ru/Yandex'da Inbox/Spam va «Show original» da
   SPF/DKIM/DMARC = PASS ekanini tasdiqlash. Production faqat foydalanuvchi ruxsati bilan.
