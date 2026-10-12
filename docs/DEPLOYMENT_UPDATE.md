# Vercel configuration update

Prepared deployment configuration for the client to supply their actual domains and database settings. Existing DATABASE_URL and DIRECT_URL in backend/.env were preserved. URL fields are blank intentionally; they must be filled before production builds or startup.

## Client steps

1. Fill frontend/.env `API_URL` with the deployed API HTTPS origin (no `/api/v1`).
2. Fill backend/.env `FRONTEND_ORIGIN` with the frontend HTTPS origin (no trailing slash). Add any exact preview/custom-domain origins to `ADDITIONAL_FRONTEND_ORIGINS` if needed.
3. Review backend DATABASE_URL/DIRECT_URL, NODE_ENV, TRUST_PROXY, DB_POOL_MAX, and DB_CONNECT_TIMEOUT_MS. Never place database variables in the frontend.
4. Copy the respective app values into each Vercel project's Settings → Environment Variables for the intended Production/Preview environment. Vercel supplies VERCEL, VERCEL_ENV, VERCEL_URL, and its runtime PORT; do not manually invent them.
5. Set each project's root to frontend/backend and Node version to 24. The new per-app vercel.json files specify native Next.js/NestJS detection, frozen pnpm installation, and the required build commands.
6. Redeploy after changing URLs; Next.js rewrites are generated during the frontend build. Run public smoke tests afterward.

## Code changes

- Frontend production routing requires API_URL; hosted routes reject HTTP/loopback targets, credentials, query/hash, and accidentally appended API paths. Local development retains its explicit development fallback. Static type generation loads rewrites too and therefore needs API_URL when run in production mode.
- Backend production and Vercel previews require public HTTPS frontend origins. CORS and mutation CSRF checks share an explicit allowlist; unknown origins remain blocked.
- Session cookies are Secure for production and Vercel previews, independent of accidental development NODE_ENV values on hosted instances.
- Express uses a bounded trusted-proxy setting, addressing forwarded-IP/rate-limiter behavior behind Vercel. PostgreSQL pool and connection timeout are configurable and validated.
- The deployment script reads the client's actual API/frontend origins from the respective .env files; assumed project-domain URLs were removed. It excludes .env files from uploads and still requires separate authorization to send database credentials as sensitive cloud variables.

## Executed verification

| Check | Result |
|---|---|
| Backend unit suites, including 9 new hosted environment cases | PASS: 38 tests, 0 failed |
| Isolated PostgreSQL API integration suite | PASS: 15 tests, 0 failed |
| `node scripts/verify-deployment-config.mjs` | PASS: 9 routing checks |
| `API_URL=https://api.example.com pnpm typecheck` | PASS: frontend and backend |
| `pnpm lint` | PASS: frontend and backend |
| `VERCEL=1 VERCEL_ENV=production API_URL=https://api.example.com pnpm build` | PASS: both production builds |
| Deployment script JavaScript syntax | PASS |
| Vercel configuration JSON | PASS: files parsed and native presets/build commands inspected |
| Public deployment and public HTTPS smoke tests | NOT TESTED: no deployment or credential upload performed |
| Browser suite after this configuration-only follow-up | NOT TESTED: earlier 6-test browser run remains documented in ACCEPTANCE.md |

`api.example.com` was a non-secret configuration fixture used to compile and validate routing; it is not a deployed Ajaia endpoint and must not be copied into the client's settings. Missing URL fields intentionally fail validation. Initial checks exposed the expected missing-URL guard and a typed adapter API mismatch, both corrected/verified. The TypeScript routing runner required sandbox IPC permission; it was rerun outside the sandbox. No product test was suppressed. The root pnpm install layout was restored after isolated production checks, without changing dependencies or the lockfile.

For local development, set backend NODE_ENV=development, FRONTEND_ORIGIN=http://localhost:3000, TRUST_PROXY=0, and frontend API_URL=http://localhost:4000. Production configuration deliberately requires real HTTPS domains instead of localhost fallbacks.
