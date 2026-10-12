# Architecture

The browser renders Next.js client page implementations and Tiptap. Its shared Fetch client calls `/api/v1` through a same-origin Next.js rewrite to NestJS. Every mutation carries `X-Ajaia-Request: 1`; Nest rejects incorrect browser origins and cross-site form submissions. Protected reads and writes resolve a random HttpOnly cookie against its SHA-256 token hash and expiry in PostgreSQL. Login is deliberately limited to three seeded demo identities. Logout deletes the server session, clears its cookie, and clears account-scoped browser drafts.

NestJS modules own authentication, eligible users, document operations, sharing, imports, and database initialization. DTO validation trims and bounds titles, validates UUIDs/enums/versions, rejects unknown DTO fields, and validates JSON structure independently of the editor. A global error filter returns `{statusCode,message}` and conceals internal exceptions. Readiness checks query PostgreSQL; startup also checks connectivity. There is no in-memory persistence fallback.

Prisma 7.10 uses the `prisma-client` generator with explicit ESM output under `src/generated/prisma`, `prisma.config.ts` for CLI datasource configuration, and `@prisma/adapter-pg` with `pg` for runtime access. Generated code compiles with the NestJS NodeNext build. Migrations use the optional direct URL, while runtime uses DATABASE_URL. Schema-aware adapters enable dedicated test schemas without modifying production tables.

User owns Document and participates in DocumentShare. Session references User. Foreign keys cascade deleted documents' shares and deleted users' owned records. `(documentId,userId)` is unique. Owner/document and recipient-share indexes support dashboard queries. Self-sharing is rejected by the service; target-user existence and duplicate grants are verified before returning success.

Owners control titles, deletion, and access. VIEW grants content reads; EDIT additionally permits content saves. Unauthorized documents are concealed with 404. Shared non-owner control attempts return 403. List responses omit body content and expose only owned/shared documents. Full fetches return public owner data and the caller's permission, without exposing the access-management list to shared recipients.

Content saves issue an atomic `updateMany` requiring the document ID, expected version, and current owner-or-EDIT relationship. That statement increments the version; a transaction returns the resulting version/update time. A revoked or downgraded user cannot save via an earlier authorization check. Stale versions return 409. Content changes are not merged in real time.

The editor serializes saves, snapshots the submitted content, and compares the newest local content against the acknowledged snapshot. Edits arriving during a save remain dirty and schedule another save. Failed saves stop automatic retries, keep local content, and offer explicit retry/export/reload. Tab-local drafts protect fast navigation. Browsers cannot guarantee asynchronous persistence during unload; the interface does not promise it.

Imports use bounded multipart memory buffers and persist only successfully converted JSON. Fatal UTF-8 decoding, MIME/extension checks, control-character/binary checks, one-file and size limits reject unsafe input. Markdown token conversion emits only supported rich nodes and marks. Raw HTML remains text. No uploaded file is executed, embedded as HTML, or retained on disk.

Frontend styles use Sass modules in the user's prescribed folders, a shared stylesheet, and Tailwind via its standard PostCSS plugin. Route files initialize pages; UI implementations remain under `src/component`. React state is sufficient for this bounded MVP.
