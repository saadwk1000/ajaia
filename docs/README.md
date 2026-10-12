# Ajaia Docs

A focused document workspace for small teams and product demonstrations. Create and organize documents, edit rich text, import notes, and share VIEW or EDIT access with another demo account. Shared access uses optimistic version checks; it is not real-time co-editing.

## Prerequisites and setup

Use Node 24 LTS (development was verified on Node 26.5.0), pnpm 11.28.5, and PostgreSQL. This workspace preserves the existing `frontend` and `backend` directories. All commands below run from the workspace root unless explicitly marked otherwise.

```sh
pnpm install --frozen-lockfile
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# For local development: configure backend/.env DATABASE_URL/DIRECT_URL,
# NODE_ENV=development, FRONTEND_ORIGIN=http://localhost:3000, TRUST_PROXY=0.
# Set frontend/.env API_URL=http://localhost:4000.
# For Vercel, use the actual HTTPS origins instead; see DEPLOYMENT.md.
# Alternatively, run the local database:
docker compose up -d
pnpm --filter backend prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Do not overwrite an existing `.env`: merge any missing variables. The configured database in this development session already exists and was migrated and seeded; its credentials were preserved. Frontend: `http://localhost:3000`; API: `http://localhost:4000/api/v1`. The root `dev` script runs both apps. Individual commands: `pnpm --filter frontend dev` and `pnpm --filter backend dev`.

For a production startup locally:

```sh
pnpm build
pnpm --filter backend start:prod
# In another terminal:
pnpm --filter frontend start
```

Set `DATABASE_URL`, optional `DIRECT_URL`, `FRONTEND_ORIGIN`, optional `ADDITIONAL_FRONTEND_ORIGINS`, `NODE_ENV`, `TRUST_PROXY`, `DB_POOL_MAX`, and `DB_CONNECT_TIMEOUT_MS` on the API. PORT is a standalone startup fallback; let Vercel supply its runtime port. Production and Vercel previews require explicit public HTTPS frontend origins. Set the frontend's server-side `API_URL` before building. Requests use Next.js rewrites; there is no database credential or backend session token exposed to browser JavaScript. Do not set `NODE_ENV=production` with the local HTTP origin.

## Demo journey

Open `/login` and choose Alice (`alice@ajaia.demo`), Bob (`bob@ajaia.demo`), or Charlie (`charlie@ajaia.demo`). These publicly selectable identities are demonstration accounts; never store sensitive data here. Registration and email invitations are not implemented.

Create a document, rename it with the pencil control, and use the toolbar for bold, italic, underline, H1–H3, bullets, numbering, undo, and redo. Changes save after one second of inactivity. Wait for **Saved** before switching devices or closing the tab. Dashboard owners can rename, share, and delete documents; deletion requires confirmation.

Open Share, select another account, and grant Viewer or Editor access. Log out deliberately and choose the recipient to find the document under **Shared with me**. Viewers cannot edit; editors can save content but cannot rename, delete, or manage access. Owners can update or revoke access. Revocations affect subsequent server requests; already displayed text cannot be remotely erased from a browser.

Imports support UTF-8 `.txt` and `.md`, one file per request, up to 2 MB. TXT preserves paragraphs and line breaks literally. Markdown supports paragraphs, H1–H3, bold, italic, nested bullets, and numbered lists. H4–H6 become H3. Links retain labels, images retain alt text, and code becomes plain text. HTML is never executed. Tables, task-list interactivity, embedded images, and DOCX/PDF import are unsupported. Converted JSON is bounded to 2 MB, 100,000 nodes, and nesting depth 40; very complex text can exceed those bounds even when its source file is smaller than 2 MB.

## Reliability and limitations

A document version increments on each content save. A stale save returns 409 and leaves the local editor intact. Changes are not merged automatically. On failure, retry or export the local JSON; use Reload latest to review the server version. Recoverable drafts are scoped by account/document in tab-local sessionStorage and cleared on deliberate logout. Drafts can be restored after fast navigation or refresh. Draft recovery is not a backup: closing the tab, clearing browser storage, or disabling storage can discard it. Back-to-dashboard and browser unload warn about unsaved changes; asynchronous saves are not promised to complete during unload.

The production demo uses database sessions, strict origin checks, a required custom request header, HttpOnly cookies, structured content validation, bounded uploads, and Helmet. Rate limiting is per running API instance; it is not a distributed abuse-prevention service. There is no production identity verification, live synchronization, ownership transfer, registration, email delivery, DOCX import, or CRDT merge.

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test
cp backend/.env.test.example backend/.env.test
# Configure TEST_DATABASE_URL to a dedicated test database or ajaia_test schema.
pnpm test:integration
pnpm exec playwright install chromium
pnpm test:e2e
```

Integration tests refuse a non-test database/schema, apply additive migrations, seed its demo accounts, and clean up only documents and sessions created by the suite. Browser tests use the built apps and configured development database, create their own documents, and delete those documents afterward. Build first; do not rebuild while production browser tests are running. See [TESTING.md](TESTING.md) for coverage and [ACCEPTANCE.md](ACCEPTANCE.md) for executed results.

## Structure and decisions

- `frontend/src/app`: Next.js route files that only initialize page components; framework metadata/layout remain here.
- `frontend/src/component/page`: camelCase page folders with `index.tsx`, initialization-only `page.tsx`, `style.module.scss`, and `types.ts`.
- `frontend/src/component/UI`: reusable camelCase component folders with `index.tsx`, `style.module.scss`, and `types.ts`.
- `frontend/src/styles/styles.scss`: shared styles; Tailwind is loaded through `tailwind.css` and PostCSS.
- `frontend/src/lib` and `hooks`: typed Fetch client and session handling. React state suffices; Yup, Formik, Redux slices, and stores are not introduced.
- `backend/src`: NestJS auth, users, documents, sharing, imports, Prisma, and common modules.
- `backend/prisma`: schema, additive migrations, deterministic seed.
- `tests/e2e`: Playwright workflows; browser artifacts live under `docs`.
- `docs`: prompts, conventions, architecture, API, deployment, test evidence, and archived scaffold references.

Tiptap provides editor/history behavior; JSON preserves formatting without storing arbitrary HTML. Prisma/PostgreSQL provides typed relations, foreign keys, uniqueness, cascade deletion, and atomic conditional saves. Opaque database sessions keep identity under server control and allow immediate logout invalidation. TXT/Markdown keeps the upload requirement practical within the six-hour cap. Existing scaffold code was archived instead of discarded. Next.js may regenerate `frontend/AGENTS.md` when starting development; the original guidance was preserved in `docs/FRONTEND_AGENTS.md` in accordance with the requested documentation location.

The original frontend Git history is retained locally. The complete workspace is published together in the GitHub repository: frontend, backend, migrations, tests, deployment configuration, and docs. Secret environment files and generated dependencies/build artifacts are excluded. See PUBLICATION.md for the checks performed before publication.

Deployment details and verified URLs are recorded in [DEPLOYMENT.md](DEPLOYMENT.md). Full implementation and acceptance evidence is recorded in [ACCEPTANCE.md](ACCEPTANCE.md).
