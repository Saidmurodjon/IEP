# Energetika muammolari instituti — Rasmiy veb-sayt

O'zbekiston Respublikasi Fanlar akademiyasi Energetika muammolari institutining rasmiy veb-sayti.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, TypeScript |
| i18n       | react-i18next (uz/en/ru)               |
| Backend    | Bun + Hono, TypeScript                  |
| Database   | Neon PostgreSQL + Prisma ORM            |
| Auth       | JWT                                     |
| Deployment | Cloudflare Pages (web) + Workers (api)  |

## Project Structure

```
/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # Bun + Hono REST API
├── packages/
│   ├── db/           # Prisma schema + seed
│   └── shared/       # Shared TypeScript types
└── .env.example
```

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET

# 2. Install dependencies
npm install

# 3. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 4. Seed database (creates admin + sample data)
npm run db:seed

# 5. Start development
npm run dev
```

## Admin Credentials (after seed)

- **URL**: http://localhost:5173/admin/login
- **Email**: `ADMIN_EMAIL` (default: admin@energetika.uz)
- **Password**: `ADMIN_PASSWORD` from `.env` — there is no default.

The seed refuses to run unless `ADMIN_PASSWORD` is set (minimum 10 characters),
so no well-known password ever ends up in the database:

```bash
# .env
ADMIN_PASSWORD="$(openssl rand -base64 24)"
```

Passwords are stored as PBKDF2-HMAC-SHA256 (210,000 iterations, random 16-byte salt).

> ⚠️ Change the password after first login:
> `POST /api/auth/change-password` with `{ "currentPassword": "...", "newPassword": "..." }`
> and a `Bearer` token (new password: minimum 10 characters).

## Deployment

### Cloudflare Workers (API)

```bash
cd apps/api
wrangler secret put DATABASE_URL
wrangler secret put JWT_SECRET
wrangler secret put FRONTEND_URL
wrangler deploy
```

### Cloudflare Pages (Frontend)

```bash
cd apps/web
# Set VITE_API_URL in Cloudflare Pages dashboard
npm run build
# Deploy dist/ folder to Cloudflare Pages
```

## Languages

- 🇺🇿 O'zbek (uz) — default
- 🇬🇧 English (en)
- 🇷🇺 Русский (ru)
