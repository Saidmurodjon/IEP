#!/usr/bin/env bash
# iep.uz ga deploy: API paketi + migratsiyalar (oldin baza zaxirasi) + frontend.
# Avval: npm run build:node --workspace=apps/api va web uchun dist-webname build (docs/deploy-hosting.md 6-bo'lim).
set -euo pipefail
cd "$(dirname "$0")/../../.."
KEY="$HOME/.ssh/iep_prod"; HOST="iepuz@web2.webspace.uz"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o ConnectTimeout=20)

echo "→ API fayllari yuklanmoqda"
COPYFILE_DISABLE=1 tar -C apps/api/deploy/iep-api -czf - server.cjs seed.cjs package.json prisma \
  | "${SSH[@]}" "$HOST" 'cd ~/iep-api && tar -xzf - --no-same-owner'

echo "→ serverda: zaxira, generate, migrate, restart"
"${SSH[@]}" "$HOST" 'bash -s' <<'REMOTE'
set -eo pipefail
find_url() { python3 -c '
import json,sys
def walk(o):
    if isinstance(o,dict):
        v=o.get("DATABASE_URL")
        if isinstance(v,str) and v: print(v); sys.exit()
        for x in o.values(): walk(x)
    elif isinstance(o,list):
        for x in o: walk(x)
try: walk(json.load(sys.stdin))
except Exception: pass'; }
DATABASE_URL="$(cloudlinux-selector list --json --interpreter nodejs 2>/dev/null | find_url || true)"
[ -n "$DATABASE_URL" ] || DATABASE_URL="$(cloudlinux-selector get --json --interpreter nodejs --app-root iep-api 2>/dev/null | find_url || true)"
[ -n "$DATABASE_URL" ] || DATABASE_URL="$(grep -h '^ *SetEnv DATABASE_URL' ~/domains/api.iep.uz/public_html/.htaccess 2>/dev/null | head -1 | awk '{print $3}' | tr -d '"')"
[ -n "$DATABASE_URL" ] || { echo "❌ DATABASE_URL topilmadi" >&2; exit 1; }
export DATABASE_URL TOKIO_WORKER_THREADS=2
mkdir -p ~/iep-backups && chmod 700 ~/iep-backups
BK=~/iep-backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql
pg_dump "$DATABASE_URL" --schema=public --no-owner --no-privileges > "$BK"; chmod 600 "$BK"
echo "  zaxira: $BK ($(du -h "$BK" | cut -f1))"
source "$HOME/nodevenv/iep-api/22/bin/activate"
cd ~/iep-api
npm install --silent --no-audit --no-fund
npm run --silent generate
echo "  migratsiyalar:"; npm run --silent migrate 2>&1 | grep -vE "^$|Environment variables|Prisma schema loaded|Datasource"
cloudlinux-selector restart --json --interpreter nodejs --app-root iep-api >/dev/null
echo "  ✅ API qayta ishga tushdi"
REMOTE

echo "→ frontend yuklanmoqda"
(cd apps/web/dist-webname && COPYFILE_DISABLE=1 tar --exclude=_headers --exclude=_redirects -czf - .) \
  | "${SSH[@]}" "$HOST" 'cd ~/domains/iep.uz/public_html && tar -xzf - --no-same-owner'

sleep 5
echo "→ tekshiruv"
for u in https://api.iep.uz/api/news https://api.iep.uz/api/about https://api.iep.uz/api/vacancies https://iep.uz/; do
  echo "  $(curl -sS -o /dev/null -w '%{http_code}' "$u")  $u"
done
echo "✅ Deploy tugadi"
