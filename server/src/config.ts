import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

/** Must match the dev fallback in jwtSecret — production must not use this value */
export const DEV_JWT_SECRET_PLACEHOLDER = 'dev-secret-change-in-production';

const __configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite build output (repo root `dist/`), resolved from this file so it works
 * when the process cwd is `server/` or the repo root. Override with FRONTEND_DIST
 * (absolute path, or relative to process.cwd()).
 */
export function resolveFrontendDistPath(): string {
  const raw = process.env.FRONTEND_DIST?.trim();
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
  }
  return path.join(__configDir, '..', '..', 'dist');
}

function parseCorsOrigins(raw: string | undefined): string | string[] {
  if (raw?.trim()) {
    const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return list.length === 1 ? list[0]! : list;
  }
  const port = process.env.PORT || '3001';
  return [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ];
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET?.trim() || DEV_JWT_SECRET_PLACEHOLDER;
const seedPartnerSecret = process.env.SEED_PARTNER_SECRET?.trim() || '';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || './data/partners.db',
  materialsPath: process.env.MATERIALS_PATH || './materials',
  /** Dev: allow common Vite ports; set CORS_ORIGIN to a single URL or comma-separated list in production */
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
  nodeEnv,
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  /** When set, POST /api/auth/seed-partner requires header X-Seed-Partner-Secret. In production, unset = route disabled. */
  seedPartnerSecret,
  /**
   * JWT in ?token= is disabled by default (leaks via logs/referrers). Enable only for legacy clients.
   * Authenticated file access should use Authorization: Bearer.
   */
  allowAuthQueryToken: process.env.ALLOW_AUTH_QUERY_TOKEN === 'true',
  /** Behind reverse proxy (nginx, etc.) — set so rate limiting and IP use the client address */
  trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  /**
   * When true with NODE_ENV !== production, still serve the Vite `dist` folder (if present).
   * Use for a local one-port smoke test: build the client, then `SERVE_STATIC=true npm start` from `server/`.
   * In production, static is served when `dist` exists (no need to set this).
   */
  serveStatic: process.env.SERVE_STATIC === 'true' || process.env.SERVE_STATIC === '1',
};

const MIN_PROD_JWT_LEN = 32;

/** Call after loading config; exits process in production if misconfigured */
export function assertConfigOrExit(): void {
  if (config.nodeEnv !== 'production') return;

  if (!process.env.JWT_SECRET?.trim()) {
    console.error('FATAL: Production requires JWT_SECRET to be set in the environment.');
    process.exit(1);
  }
  if (config.jwtSecret === DEV_JWT_SECRET_PLACEHOLDER) {
    console.error('FATAL: Production cannot use the default JWT_SECRET placeholder.');
    process.exit(1);
  }
  if (config.jwtSecret.length < MIN_PROD_JWT_LEN) {
    console.error(`FATAL: Production JWT_SECRET must be at least ${MIN_PROD_JWT_LEN} characters.`);
    process.exit(1);
  }
}
