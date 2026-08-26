import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { getDb } from './lib/db';
import { authRouter } from './routes/auth';
import { newsRouter } from './routes/news';
import { publicationsRouter } from './routes/publications';
import { structureRouter } from './routes/structure';
import { settingsRouter } from './routes/settings';
import { contactRouter } from './routes/contact';
import { employeesRouter } from './routes/employees';
import { partnersRouter } from './routes/partners';
import type { PrismaClient } from '@prisma/client';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

export type AppContext = {
  Variables: { db: PrismaClient; adminId: string; email: string };
  Bindings: Env;
};

const app = new Hono<AppContext>();

// Inject DB per request using Cloudflare env binding
app.use('*', async (c, next) => {
  c.set('db', getDb(c.env.DATABASE_URL));
  await next();
});

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', async (c, next) =>
  cors({
    origin: ['http://localhost:5173', c.env.FRONTEND_URL ?? ''].filter(Boolean),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next)
);

app.get('/', (c) => c.json({ status: 'ok', service: 'Energetika API', version: '1.0.0' }));

app.route('/api/auth', authRouter);
app.route('/api/news', newsRouter);
app.route('/api/publications', publicationsRouter);
app.route('/api/structure', structureRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/contact', contactRouter);
app.route('/api/employees', employeesRouter);
app.route('/api/partners', partnersRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
