# REST API

Base path: `/api/v1`. Protected endpoints use a validated `ajaia_session` HttpOnly cookie. All POST/PATCH/DELETE requests require `X-Ajaia-Request: 1`; browser Origin must equal FRONTEND_ORIGIN. Normal responses are JSON. Errors use `{ "statusCode": number, "message": string | string[] }`. No protected response is cached.

| Method/path | Authentication and behavior |
|---|---|
| GET `/health` | Public database readiness; 200 or 503 |
| GET `/auth/demo-users` | Public bounded demo identity list |
| POST `/auth/demo-login` | `{userId: UUID}` from seeded allowlist; sets one-day session; 201 |
| POST `/auth/logout` | Invalidates presented session and clears cookie; 201 |
| GET `/auth/me` | Current public user; 401 if absent/expired |
| GET `/users` | Protected; eligible other demo users |
| POST `/documents` | Protected; creates owned Untitled Document with valid empty JSON; 201 |
| GET `/documents?scope=owned` | Protected; owned summaries, newest first |
| GET `/documents?scope=shared` | Protected; accessible shared summaries and caller's permission |
| GET `/documents/:id` | Owner/VIEW/EDIT; returns structured content, version, owner, permission |
| PATCH `/documents/:id/title` | Owner; `{title: string}` trimmed, 1–150 characters |
| PATCH `/documents/:id/content` | Owner/EDIT; `{content: TiptapJSON,expectedVersion: positiveInteger}`; returns `{version,updatedAt}`; stale versions 409 |
| DELETE `/documents/:id` | Owner; cascades shares; returns `{success:true}` |
| GET `/documents/:id/shares` | Owner; access list with public recipient details |
| POST `/documents/:id/shares` | Owner; `{userId: UUID,permission: "VIEW" | "EDIT"}`; duplicate 409, self 400 |
| PATCH `/documents/:id/shares/:shareId` | Owner; `{permission: "VIEW" | "EDIT"}` |
| DELETE `/documents/:id/shares/:shareId` | Owner; share must belong to specified document |
| POST `/documents/import` | Protected; multipart `file`, one UTF-8 `.txt`/`.md` ≤2 MB; 201 created document |

401 indicates no valid session, 403 an insufficient permission/origin, 404 missing/inaccessible resources, 400 invalid input, 409 a conflict, 413 oversized uploads/requests, 415 unsupported import type, and 429 throttling. Internal exceptions return a generic 500 response. Content JSON accepts paragraphs, H1–H3, hard breaks, lists/list items, and bold/italic/underline marks. Unsupported properties, executable attributes, and content types are rejected. Numbered lists accept the installed editor's null/default numbering attribute and safe HTML numbering values.
