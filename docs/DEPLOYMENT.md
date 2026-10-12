# Deployment status and instructions

## Actual status

The configured managed PostgreSQL database was reachable, initially had no public application tables, and was successfully migrated and seeded. Local production builds, database workflows, and browser checks are recorded in ACCEPTANCE.md.

Vercel CLI authentication succeeded. Two empty projects were created in the authenticated account: `ajaia-docs-api` and `ajaia-docs-web`. No deployment succeeded, and no public application URL is verified.

Automatic approval review rejected `node scripts/deploy.mjs` because deployment sends `DATABASE_URL` and `DIRECT_URL` from `backend/.env` to Vercel and creates production deployments without explicit user authorization to send those secrets to that destination. No workaround was attempted. The required next action is permission to send those database URLs as sensitive production environment variables to the new Ajaia API Vercel project and publish both apps. Reconsider the database credentials/service if this database should not be used for a public demo.

## Prepared path

Vercel now officially supports NestJS `src/main.ts` entrypoints as a Vercel Function, and its documented 4.5 MB function payload limit accommodates the application's 2 MB upload bound. This is the available authenticated hosting option; a separate Render/Railway account was not assumed. No free-tier availability, project spending limit, or database quota was inferred.

References checked during implementation:

- [NestJS on Vercel](https://vercel.com/docs/frameworks/backend/nestjs)
- [Vercel function limits](https://vercel.com/docs/functions/limitations)
- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Render Node deployment](https://render.com/docs/deploy-node-express-app), an alternative if desired.

The reviewed script `scripts/deploy.mjs` prepares a source-only staging workspace under the system temporary directory; excludes `.env`, `.git`, node_modules, generated Prisma files, build output, and tests; configures the two projects with Node 24 and their root directories; passes secrets through stdin to Vercel's authenticated environment API; and deploys after configuration. Database URL values are stored as sensitive environment variables, are never frontend variables, and are redacted from logged output. Migration and seed already ran locally against the configured database; deployment does not reset it.

Project settings:

| Setting | Web | API |
|---|---|---|
| Root Directory | `frontend` | `backend` |
| Framework | Next.js | NestJS |
| Node | 24.x | 24.x |
| Install | `pnpm install --frozen-lockfile` | `pnpm install --frozen-lockfile` |
| Build | `pnpm build` | `pnpm prisma:generate && pnpm build` |
| Environment | server-side `API_URL` | `DATABASE_URL`, optional `DIRECT_URL`, HTTPS `FRONTEND_ORIGIN`, optional `ADDITIONAL_FRONTEND_ORIGINS`, `NODE_ENV=production`, `TRUST_PROXY=1`, `DB_POOL_MAX=5`, `DB_CONNECT_TIMEOUT_MS=10000` |

Production API cookies are Secure, HttpOnly, SameSite=Lax. Frontend rewrites proxy `/api/v1` to API_URL, preserving same-origin browser sessions. FRONTEND_ORIGIN must exactly match the public frontend origin; preview origins are not automatically authorized. The script now reads FRONTEND_ORIGIN from backend/.env and API_URL from frontend/.env. Fill the actual project/custom-domain origins first; it rejects missing values and never assumes a project domain. Public access configuration is applied only to these new demo projects.

After explicit authorization, execute from the workspace root:

```sh
node scripts/deploy.mjs
```

Then verify the actual URLs with a real browser: login, create, rich formatting/save, refresh, import, VIEW/EDIT sharing, unauthorized writes, revocation, logout, browser console, and backend logs. Verify the API health endpoint independently. Add verified public URLs only after these checks pass. Cold starts and per-instance rate limiting are deployment limitations; PostgreSQL, not function memory or disk, stores documents and sessions.

## Other Node hosts

A compatible Node service may run `pnpm --filter backend prisma:generate && pnpm --filter backend build`, then `pnpm --filter backend prisma:migrate` and `pnpm --filter backend start:prod`. The API binds `0.0.0.0` and respects PORT. Set an HTTPS frontend origin, verified PostgreSQL TLS connection settings, and database credentials in provider secrets. Use `prisma migrate deploy`, never a reset or destructive development migration against production. The frontend may be hosted on Vercel independently with API_URL pointed to that service.

## Client environment handoff

The checked-in example files and local frontend/.env/backend/.env now list deployment settings. Existing local database credentials were retained. URL fields are intentionally blank: the client must fill them. Neither .env file is uploaded by the deployment script. Add the real values to each project's Settings → Environment Variables before deployment; local .env files are not a substitute for Vercel project environment settings.

| Project | Variable | Client action |
|---|---|---|
| Frontend | API_URL | Actual API HTTPS origin, e.g. `https://your-api.vercel.app`; exclude `/api/v1`. Server-only, read during build; redeploy after changes. |
| API | DATABASE_URL | Provider's pooled PostgreSQL URL with TLS verification; sensitive. |
| API | DIRECT_URL | Optional direct URL used only by Prisma CLI migrations; sensitive. |
| API | FRONTEND_ORIGIN | Actual frontend HTTPS origin, e.g. `https://your-web.vercel.app`; no trailing slash/path. |
| API | ADDITIONAL_FRONTEND_ORIGINS | Optional comma-separated exact preview/custom-domain HTTPS origins. Both CORS and CSRF use this allowlist. No wildcard `.vercel.app` access. |
| API | NODE_ENV | `production` for the deployed API. Hosted previews still enforce HTTPS and secure cookies even if this is absent or incorrectly set to development. |
| API | TRUST_PROXY | `1` on Vercel; `0` for direct local access. Enables forwarded IP handling without globally trusting all proxies. |
| API | DB_POOL_MAX | `5` connections per instance initially; adjust to database capacity (1–20 supported). |
| API | DB_CONNECT_TIMEOUT_MS | `10000` initially (1000–60000 supported). |
| API | PORT | `4000` for standalone local startup; do not override the platform's port on Vercel. |

VERCEL, VERCEL_ENV and VERCEL_URL are Vercel-managed system values. Do not manually fill them. The API project's VERCEL_URL identifies the **API**, so it cannot be used to infer the frontend origin. Preview frontend URLs must be added explicitly to the API allowlist. [Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables), [project environment configuration](https://vercel.com/docs/environment-variables).

Each app now includes vercel.json with its native framework and build/install commands. Set project Root Directory to frontend or backend respectively, retain access to the workspace root for pnpm, and select Node 24. Native NestJS entrypoint detection uses backend/src/main.ts; no legacy serverless routing wrapper is needed. [NestJS deployment support](https://vercel.com/docs/frameworks/backend/nestjs).

Deployment guards intentionally fail clearly when URL settings are missing, invalid, or point to localhost on Vercel. Browser requests remain relative `/api/v1`; the frontend proxies them to the configured API so production session cookies remain same-origin. Configure PUBLIC frontend/API deployment accessibility before smoke testing; a protected Vercel API deployment cannot serve ordinary public proxy requests without provider access configuration.
