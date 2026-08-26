/**
 * Foydalanuvchi tomonidagi xatolarni yig'ib serverga yuborish.
 *
 * Uchta cheklov ataylab qo'yilgan:
 * 1. **To'plamda yuborish** — har bir xato uchun alohida so'rov qilinmaydi.
 * 2. **Seans chegarasi** — halqaga tushgan sahifa serverni ko'mib tashlamasin.
 * 3. **Yuborishning o'zi xato bersa qayta qayd etilmaydi** — cheksiz halqa
 *    hosil bo'lmasligi uchun.
 */

interface ClientLogEntry {
  message: string;
  stack?: string;
  path?: string;
  level?: 'error' | 'warning' | 'info';
  code?: string;
  statusCode?: number;
}

/** Bitta seansda yuboriladigan eng ko'p yozuv. */
const MAX_PER_SESSION = 20;
/** To'plamni yuborish oralig'i. */
const FLUSH_INTERVAL_MS = 5000;
/** Bitta to'plamdagi eng ko'p yozuv. */
const MAX_BATCH = 5;

const queue: ClientLogEntry[] = [];
let sentCount = 0;
let timer: ReturnType<typeof setInterval> | null = null;

/**
 * Yuborish jarayonining o'zida xato bo'lganda bayroq ko'tariladi va
 * o'sha xato qayta navbatga qo'yilmaydi.
 */
let sending = false;

function endpoint(): string {
  const base = import.meta.env.VITE_API_URL ?? '';
  return `${base}/api/logs/client`;
}

/** Navbatdagi bitta yozuvni yuboradi. Hech qachon `throw` qilmaydi. */
async function post(entry: ClientLogEntry): Promise<void> {
  sending = true;
  try {
    await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true,
    });
  } catch {
    // Jurnalga yuborish xatosi QAYTA QAYD ETILMAYDI (cheksiz halqa).
  } finally {
    sending = false;
  }
}

async function flush(): Promise<void> {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  for (const entry of batch) {
    await post(entry);
  }
}

/** Sahifa yopilayotganda navbatni `sendBeacon` bilan yuboradi. */
function flushWithBeacon(): void {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  for (const entry of batch) {
    try {
      const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
      navigator.sendBeacon(endpoint(), blob);
    } catch {
      // Yuborilmasa ham sahifa yopilishiga to'sqinlik qilmaymiz.
    }
  }
}

/** Xatoni navbatga qo'yadi. Chaqiruvchi kod uchun xavfsiz. */
export function reportClientError(entry: ClientLogEntry): void {
  // Yuborish jarayonidagi xato qayta navbatga tushmasin.
  if (sending) return;
  if (sentCount >= MAX_PER_SESSION) return;
  // O'z endpointimizdagi xatoni qayd etmaymiz.
  if (entry.path?.includes('/api/logs/client')) return;

  sentCount += 1;
  queue.push({
    ...entry,
    message: entry.message.slice(0, 1000),
    stack: entry.stack?.slice(0, 5000),
    path: entry.path ?? window.location.pathname,
  });
}

/**
 * Global tutuvchilarni o'rnatadi. `main.tsx` da bir marta chaqiriladi.
 */
export function installClientLogger(): void {
  if (timer) return;

  window.addEventListener('error', (event) => {
    reportClientError({
      message: event.message || 'Unhandled error',
      stack: event.error instanceof Error ? event.error.stack : undefined,
      level: 'error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportClientError({
      message: reason instanceof Error ? reason.message : `Unhandled rejection: ${String(reason)}`,
      stack: reason instanceof Error ? reason.stack : undefined,
      level: 'error',
    });
  });

  // Sahifa yopilayotganda navbatda qolgani yuboriladi.
  window.addEventListener('pagehide', flushWithBeacon);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushWithBeacon();
  });

  timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
}
