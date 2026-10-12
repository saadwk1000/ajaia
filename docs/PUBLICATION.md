# GitHub publication verification

Destination: https://github.com/saadwk1000/ajaia.git, branch main. The destination had no existing commits/branches when inspected. The complete source tree was prepared in an isolated Git checkout to preserve the original frontend Git metadata. Frontend files are included directly, not as a submodule.

| Verification before commit | Result |
|---|---|
| Frozen pnpm installation | PASS |
| Peer dependency compatibility | PASS: no unresolved issues |
| ESLint | PASS for both apps |
| TypeScript | PASS for both apps with an explicit non-secret API routing fixture |
| Prisma generation and both production builds | PASS |
| Backend unit suites | PASS: 38 tests, 0 failed |
| PostgreSQL integration | PASS: 15 tests, 0 failed in isolated ajaia_test schema |
| Chromium user journeys | PASS: 6 tests, 0 failed |
| Hosted routing guards | PASS: 9 checks |
| Deployment script syntax | PASS |
| Candidate source credential scan | PASS: actual database URLs/passwords and common private-key/token patterns absent |
| Nested frontend source inclusion | PASS: ordinary tracked files, no gitlink |

Changes made during publication review: ignored the local pnpm cache and private/tool metadata; configured Playwright's local API/frontend servers explicitly so production environment templates cannot break local browser checks; and gave each deployment operation a fresh staging directory to prevent obsolete files carrying into later uploads.

Published source includes both applications, all camelCase UI/page implementations and styles/types, pnpm workspace/lockfile, Prisma schema/migration/seed, backend and browser tests, Vercel configurations, deployment/restart/routing scripts, blank environment examples, and documentation/screenshot evidence under docs. Runtime .env files, database credentials, node_modules, generated Prisma clients, caches, build output, and browser reports/traces are excluded.

Client values for frontend API_URL and backend FRONTEND_ORIGIN remain intentionally blank in templates. Configure them in the local files and Vercel project environments before deploying. This GitHub publication is separate from public application deployment; no Vercel deployment or credential transfer was performed as part of this push.

This document records verification of the source tree prepared for publication. The push itself is confirmed by matching the remote main commit hash after Git push.
