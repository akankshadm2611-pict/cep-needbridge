/**
 * server/index.ts — Express + Vite server entry point.
 *
 * In development: Vite middleware serves the frontend with HMR.
 * In production (`npm start` / --prod): Express serves dist/.
 * Both run on a single port — one deployable.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import volunteersRouter from './routes/volunteers.js';
import ngosRouter from './routes/ngos.js';
import requirementsRouter from './routes/requirements.js';
import applicationsRouter from './routes/applications.js';
import notificationsRouter from './routes/notifications.js';
import adminRouter from './routes/admin.js';
import publicRouter from './routes/public.js';
import uploadsRouter from './routes/uploads.js';
import { isCollectionEmpty } from './db/fileStore.js';
import { seedDatabase } from './db/seed.js';
import { startDeadlineJob } from './jobs/deadlines.js';
import { connectMongo } from './db/mongo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

fs.mkdirSync(env.DATA_DIR, { recursive: true });
fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// Apply rate limiting to API requests (production only)
if (env.NODE_ENV === 'production') {
  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { ok: false, error: 'Too many requests. Please slow down.' },
    })
  );
}

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/ngos', ngosRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadsRouter);

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(entry);
  } catch {
    return entry.replace(/\\/g, '/').includes('/server/index');
  }
}

function isProdMode(): boolean {
  return env.NODE_ENV === 'production' || process.argv.includes('--prod');
}

async function attachFrontend(): Promise<void> {
  if (isProdMode()) {
    const distDir = path.resolve(PROJECT_ROOT, 'dist');
    if (!fs.existsSync(distDir)) {
      console.error('dist/ not found. Run `npm run build` before `npm start`.');
      process.exit(1);
    }
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: PROJECT_ROOT,
      configFile: path.resolve(PROJECT_ROOT, 'vite.config.ts'),
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(PROJECT_ROOT, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.use('/api/*', notFound);
  app.use(errorHandler);
}

async function start(): Promise<void> {
  // Attempt to connect to MongoDB Atlas if MONGODB_URI is provided
  await connectMongo();

  if (isCollectionEmpty('users')) {
    console.log('🌱 Empty data store — seeding demo accounts and requirements...');
    await seedDatabase();
  }

  startDeadlineJob();
  await attachFrontend();

  app.listen(env.PORT, () => {
    console.log(`\n🌉 NeedBridge server running at http://localhost:${env.PORT}`);
    console.log(`   Mode: ${isProdMode() ? 'production' : env.NODE_ENV}`);
    console.log(`   Data: ${env.DATA_DIR}\n`);
  });
}

if (isDirectRun()) {
  start().catch((err) => {
    console.error('Failed to start NeedBridge:', err);
    process.exit(1);
  });
}

export { app };
