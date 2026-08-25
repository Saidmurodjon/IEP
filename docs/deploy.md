# GitHub orqali Cloudflare'ga deploy

`.github/workflows/deploy.yml` — `master`ga push bo'lganda ikkalasini deploy qiladi:
- **Frontend** → Cloudflare Pages (`energetika-institute`)
- **API** → Cloudflare Workers (`energetika-api`), avval DB migratsiyasi bilan

Workflow tayyor, lekin ishlashi uchun quyidagilar **bir marta** sozlanishi shart.

---

## 1. Cloudflare API token yarating

Cloudflare dashboard → My Profile → **API Tokens** → Create Token.
Ruxsatlar (kamida):
- **Account** → Workers Scripts → Edit
- **Account** → Cloudflare Pages → Edit
- **Account** → Workers KV / D1 (agar keyin kerak bo'lsa)

Account ID ni dashboard o'ng panelidan oling.

## 2. GitHub secret va variable qo'shing

Repo → Settings → Secrets and variables → Actions:

**Secrets:**
| Nom | Qiymat |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 1-bandda yaratilgan token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `DATABASE_URL` | Production Neon URL (migratsiya uchun) |

**Variables:**
| Nom | Qiymat |
|---|---|
| `VITE_API_URL` | `https://energetika-api.saidmurodjon1020.workers.dev` |

> ⚠️ `VITE_API_URL` **majburiy**. Pages'da vite proxy yo'q — u o'rnatilmasa, frontend
> API chaqiruvlarini o'ziga (`pages.dev/api/...`) yuboradi va 404 oladi.

## 3. Worker secret'lari (bir marta, wrangler orqali)

CI `wrangler deploy` secret'larga tegmaydi — ular Worker'da saqlanib qoladi.
Agar hali o'rnatilmagan bo'lsa:
```bash
cd apps/api
echo "<neon-url>"    | npx wrangler secret put DATABASE_URL
openssl rand -base64 32 | npx wrangler secret put JWT_SECRET
echo "https://energetika-institute.pages.dev" | npx wrangler secret put FRONTEND_URL
npx wrangler secret list   # tekshirish
```
(Tekshiruv: `JWT_SECRET` va `FRONTEND_URL` production'da allaqachon bor edi.)

## 4. ⚠️ Production bazani BIR MARTA baseline qiling

Baza `db push` bilan yaratilgan — migration tarixi yo'q. `migrate deploy` to'g'ridan-to'g'ri
ishlatilsa, `0_init` mavjud jadvallarni qayta yaratmoqchi bo'lib **xato beradi**.
Shuning uchun bir marta baseline:
```bash
cd packages/db
DATABASE_URL='<prod>' npx prisma migrate resolve --applied 0_init
```
Bundan keyin CI `migrate deploy` faqat yangi migratsiyalarni (`1_add_structure_staff_fields`)
qo'llaydi.

## 5. ⚠️ Deploy tartibi — nega migratsiya avval

`deploy-api` job'i **avval `migrate deploy`, keyin `wrangler deploy`** qiladi. Sabab:
yangi kod `staffCount`/`isAdvisory` ustunlarini o'qiydi. Migratsiya qo'llanmasa,
`GET /api/structure` **500** qaytaradi. Workflow shu tartibni kafolatlaydi.

## 6. Tuzilma seed'i (ixtiyoriy, alohida)

CI **seed ishlatmaydi** (seed eski demo yozuvlarni O'CHIRADI — buni CI'da avtomatik
qilish xavfli). Rasmiy tuzilmani production'ga yozish uchun qo'lda:
```bash
ADMIN_PASSWORD='...' DATABASE_URL='<prod>' npm run db:seed
```

---

## Ishga tushirish

Yuqoridagilar tayyor bo'lgach:
```bash
git push origin master
```
Push → Actions ishga tushadi → Pages va Worker deploy bo'ladi.
Qo'lda ishga tushirish: Actions → "Deploy to Cloudflare" → Run workflow.

## Muqobil: Cloudflare Git integratsiyasi (Actions'siz)

Actions o'rniga Cloudflare dashboard'da to'g'ridan-to'g'ri Git ulash ham mumkin:
- **Pages:** Workers & Pages → Create → Pages → Connect to Git → repo tanlang.
  Build buyrug'i: `npm ci && npm run build --workspace=apps/web`, chiqish: `apps/web/dist`.
  Environment variable: `VITE_API_URL`.
- **Workers:** Worker → Settings → Build → Connect repo. Root: `apps/api`.

Bu holda migratsiya tartibini o'zingiz nazorat qilasiz (dashboard build DB'ga tegmaydi).
