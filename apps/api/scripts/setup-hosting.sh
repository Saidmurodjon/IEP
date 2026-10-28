#!/usr/bin/env bash
# Hostingdagi Node.js ilovaga secret'larni o'rnatadi, migratsiya va seed'ni bajaradi.
# Mac Terminal'da ishga tushiriladi (Claude Code `!` orqali EMAS — parol so'raladi):
#   bash apps/api/scripts/setup-hosting.sh
#
# Secret'lar ekranga chiqmaydi, faylga yozilmaydi, buyruq satriga tushmaydi —
# serverga stdin orqali uzatiladi. JWT_SECRET shu yerda tasodifiy yaratiladi.
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/.ssh/iep_prod}"
SSH_HOST="${SSH_HOST:-iepuz@web2.webspace.uz}"
APP_ROOT="iep-api"
SITE_URL="https://iep.uz"

read -r -p "PostgreSQL baza nomi [iepuz_mainv1]: " DB_NAME
DB_NAME="${DB_NAME:-iepuz_mainv1}"
read -r -p "PostgreSQL foydalanuvchi [$DB_NAME]: " DB_USER
DB_USER="${DB_USER:-$DB_NAME}"
IFS= read -r -s -p "PostgreSQL paroli: " DB_PASS; echo
read -r -p "Admin email: " ADMIN_EMAIL
IFS= read -r -s -p "Admin paroli (kamida 10 belgi): " ADMIN_PASSWORD; echo
if [ "${#ADMIN_PASSWORD}" -lt 10 ]; then echo "Admin paroli juda qisqa." >&2; exit 1; fi

# Muhit o'zgaruvchilari JSON'i — paroldagi maxsus belgilar URL-kodlanadi.
# `localhost` EMAS: serverda u avval ::1 ga yechiladi, PostgreSQL esa faqat IPv4 da.
ENV_JSON="$(DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASS="$DB_PASS" \
  JWT_SECRET="$(openssl rand -hex 32)" SITE_URL="$SITE_URL" python3 -c '
import json, os, urllib.parse as u
e = os.environ
print(json.dumps({
  "DATABASE_URL": "postgresql://%s:%s@127.0.0.1:5432/%s" % (
    u.quote(e["DB_USER"], safe=""), u.quote(e["DB_PASS"], safe=""), e["DB_NAME"]),
  "JWT_SECRET": e["JWT_SECRET"],
  "FRONTEND_URL": e["SITE_URL"],
  "MEDIA_DIR": "/home/iepuz/iep-media",
  "ERROR_LOG_DIR": "/home/iepuz/iep-logs",
}))')"

# stdin: avval uch qator ma'lumot, keyin serverda bajariladigan skript.
REMOTE_READ='IFS= read -r ENV_JSON; IFS= read -r ADMIN_EMAIL; IFS= read -r ADMIN_PASSWORD; export ENV_JSON ADMIN_EMAIL ADMIN_PASSWORD; exec bash -s'
PAYLOAD="$(
  printf '%s\n%s\n%s\n' "$ENV_JSON" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
  cat <<'REMOTE'
set -euo pipefail
DATABASE_URL="$(printf '%s' "$ENV_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["DATABASE_URL"])')"
export DATABASE_URL TOKIO_WORKER_THREADS=2

echo "→ bazaga ulanish"
if ! psql "$DATABASE_URL" -Atc 'select 1' >/dev/null 2>/tmp/iep-psql.err; then
  sed -E 's#postgres(ql)?://[^ "]*#***#g' /tmp/iep-psql.err >&2; rm -f /tmp/iep-psql.err
  echo "❌ Bazaga ulanib bo'lmadi — panelda parolni tekshiring. Hech narsa o'zgartirilmadi." >&2
  exit 1
fi
rm -f /tmp/iep-psql.err

echo "→ muhit o'zgaruvchilari"
cloudlinux-selector set --json --interpreter nodejs --app-root "$APP_ROOT" --env-vars "$ENV_JSON" >/dev/null

# CloudLinux activate skripti `set -u` bilan ishlamaydi (CL_VIRTUAL_ENV).
set +u
source "$HOME/nodevenv/$APP_ROOT/22/bin/activate"
set -u
cd "$HOME/$APP_ROOT"
echo "→ migratsiyalar"
npm run --silent migrate
echo "→ seed (admin, tuzilma, sozlamalar)"
SITE_URL="$SITE_URL" npm run --silent seed

echo "→ restart"
cloudlinux-selector restart --json --interpreter nodejs --app-root "$APP_ROOT" >/dev/null
echo "✅ Tayyor"
REMOTE
)"

# Hosting SSH ulanishini ba'zan uzadi (`Connection reset by peer`) — ssh 255 bilan
# chiqsa qayta uriniladi. Skript qayta bajarilsa zarar yo'q (migrate/seed idempotent).
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  set +e
  printf '%s\n' "$PAYLOAD" | ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o ConnectTimeout=15 "$SSH_HOST" \
    "APP_ROOT=$APP_ROOT SITE_URL=$SITE_URL bash -c '$REMOTE_READ'"
  code=$?
  set -e
  [ "$code" -ne 255 ] && exit "$code"
  echo "SSH ulanmadi ($attempt/10), 30 soniyadan keyin qayta urinish..." >&2
  sleep 30
done
echo "SSH ulanmadi." >&2
exit 255
