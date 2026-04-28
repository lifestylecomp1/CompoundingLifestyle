import { existsSync } from 'fs';
import express, { type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import materialsRouter from './routes/materials.js';
import partnersRouter from './routes/partners.js';
import providerProfileRouter from './routes/providerProfile.js';
import adminRouter from './routes/admin.js';
import { assertConfigOrExit, config, resolveFrontendDistPath } from './config.js';
import { initDb, seedIfEmpty } from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  assertConfigOrExit();
  console.log('[1] Starting...');
  initDb();
  console.log('[2] DB init done');
  seedIfEmpty().then(() => console.log('[3] Seed done')).catch((e) => console.error('[3] Seed error:', e));

  const app = express();
  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/partners', partnersRouter);
  app.use('/api/provider-profile', providerProfileRouter);
  app.use('/api/admin', adminRouter);

  // Health check (no auth)
  app.get('/api/health', (_req, res) => {
    if (config.nodeEnv === 'production') {
      res.json({ status: 'ok' });
      return;
    }
    res.json({ status: 'ok', env: config.nodeEnv });
  });

  // Unmatched /api/* → JSON 404 (do not send SPA for unknown API paths)
  const apiNotFound: RequestHandler = (req, res, next) => {
    if (!req.path.startsWith('/api') || res.headersSent) {
      return next();
    }
    res.status(404).json({ error: 'Not found' });
  };
  app.use(apiNotFound);

  const distPath = resolveFrontendDistPath();
  const shouldServeSpa = existsSync(distPath) && (config.nodeEnv === 'production' || config.serveStatic);
  if (shouldServeSpa) {
    const indexHtml = path.join(distPath, 'index.html');
    app.use(express.static(distPath, { index: false, fallthrough: true }));
    // SPA: after static, serve index.html for non-API page routes (e.g. /, /login)
    const spaFallback: RequestHandler = (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(indexHtml, (err) => (err ? next(err) : undefined));
    };
    app.use(spaFallback);
  } else if (config.nodeEnv === 'production' && !existsSync(distPath)) {
    console.warn(
      `[warn] No frontend build at ${distPath}. Set FRONTEND_DIST or run the client build (npm run build) from the repo root.`,
    );
  }

  const port = config.port;
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    if (shouldServeSpa) {
      console.log(`Server running at ${url} (API + static SPA from ${distPath})`);
    } else {
      console.log(`Server running at ${url}`);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
