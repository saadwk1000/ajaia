# Testing

Run commands from the workspace root. The root scripts are `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm test:integration`, and `pnpm test:e2e`.

`pnpm test` runs Jest security/conversion/environment unit tests. `pnpm test:integration` runs real NestJS requests through Supertest against PostgreSQL. Configure `backend/.env.test` using the example; TEST_DATABASE_URL must identify a database with `test` in its name or a schema beginning `ajaia_test`. Production-schema tests are refused. Tests apply additive migrations and seed the isolated schema, then clean only records they created. The test schema and deterministic demo accounts remain for reuse.

Browser tests use Chromium and production builds. Install with `pnpm exec playwright install chromium`; run `pnpm build` first. `pnpm test:e2e` starts missing API/frontend production servers and reuses running ones. Stop older servers after changing their build. Do not rebuild while tests are serving `.next`. Playwright creates its own demo documents and cleans only those IDs. `docs/playwright-report/index.html` contains the final browser report; failure traces/screenshots, when produced, are under `docs/test-results`. Initial unsuccessful runs are retained separately in docs. Tracing is opt-in with `AJAIA_TRACE=1 pnpm test:e2e`: this host reported ENOSPC while writing traces for a multi-tab test, and that same workflow passed without tracing. Screenshots remain enabled and all browser assertions run either way.

Coverage includes:

- Empty and formatted JSON, unsupported nodes/attributes/marks, nesting, installed Tiptap numbered-list attributes.
- UTF-8, binary signatures, extensions/MIME, empty files, Markdown conversion, literal HTML, filenames.
- Authentication, forged cookies, exact origin/custom-header CSRF boundary, validation, demo allowlist, readiness.
- Real owned CRUD, inaccessible ID protection, title limits, persistence, stale versions, atomic simultaneous saves.
- VIEW/EDIT access, duplicate/self/invalid sharing, owner controls, downgrade, revocation, cascade deletion, logout invalidation.
- Import ownership/reopen, over-2-MB uploads, multiple files, unsupported PDF/DOCX, unauthorized imports.
- Browser toolbar, autosave, refresh, rename/delete, imports, sharing, readonly mode, editor access, failed-save retry, concurrent-edit conflict, fast-navigation draft recovery, logout/account switching, mobile overflow.

Unit tests do not substitute for PostgreSQL/browser checks. Only the executed final results in ACCEPTANCE.md are treated as PASS. Deployment smoke tests use public HTTPS URLs and verify real behavior independently of local builds.

Deployment follow-up: `node scripts/verify-deployment-config.mjs` validates hosted routing guards using non-secret fixture origins. Fill frontend/.env API_URL before type generation or production builds; for isolated checks, `API_URL=https://api.example.com pnpm typecheck` supplies a test fixture. Current backend unit coverage also verifies Vercel previews, secure cookies, exact additional origins, and bounded proxy/pool settings.

The browser runner now overrides its local API server with NODE_ENV=test, the exact localhost frontend origin, and TRUST_PROXY=0; it sets the frontend API_URL to localhost explicitly. Production .env templates remain unchanged. Before running browser tests locally, compile with `API_URL=http://localhost:4000 pnpm build`.
