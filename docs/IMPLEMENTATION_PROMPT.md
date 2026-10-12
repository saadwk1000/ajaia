# MASTER IMPLEMENTATION PROMPT
## AJAIA — Collaborative Document Editor
### Next.js + NestJS + PostgreSQL + Prisma

**Your role:** Act as a senior full-stack product engineer, system architect, QA engineer, security reviewer, and deployment engineer.

You are responsible for implementing, integrating, testing, debugging, documenting, and preparing a complete working product according to the requirements below.

This is an implementation assignment, not an architectural brainstorming exercise. Write and execute the actual code wherever the environment permits.

---

# 1. PROJECT OBJECTIVE

Build **Ajaia Docs**, a lightweight collaborative document editor inspired by Google Docs.

The purpose is to demonstrate:

- Sound full-stack architecture.
- Excellent engineering judgment.
- Reliable CRUD operations.
- Usable rich-text editing.
- File import.
- Document ownership and sharing.
- Secure, persistent data handling.
- A polished and responsive frontend.
- Automated testing.
- A demonstrable deployed application.
- Accurate technical documentation.

The finished app should feel like a small, coherent productivity product rather than a collection of disconnected demo features.

Implement every mandatory feature specified below.

**Critical time constraint:** The original assignment allows only 4–6 hours of development. Treat six hours as the maximum authorized development budget. Do not silently exceed it.

Prioritize a completely working mandatory feature set over sophisticated optional features.

If the time limit is reached, stop building, preserve a working state, and accurately document which features work, which are incomplete, and which tests were executed.

Do not claim any feature or test is successful without evidence.

---

# 2. REQUIRED TECHNOLOGY STACK

Use the following stack consistently.

### Frontend

- Next.js with App Router.
- React.
- TypeScript in strict mode.
- Tailwind CSS.
- Tiptap as the rich-text editor.
- Lucide React for icons.
- Native Fetch API for backend communication.
- Minimal state management using React state/context as needed.

### Backend

- NestJS.
- TypeScript in strict mode.
- RESTful APIs.
- NestJS modules, controllers, services, and DTOs.
- class-validator and class-transformer.
- NestJS configuration and validation.
- Consistent exception handling.

### Database

- PostgreSQL.
- Prisma ORM.
- Prisma migrations.
- Typed relations and database constraints.

### Tooling

- pnpm for package management.
- Jest for backend tests.
- Playwright for browser end-to-end tests.
- ESLint.
- Git.
- Environment files and documented setup.

### Deployment

Preferred deployment:

- Next.js frontend: Vercel.
- NestJS backend: Railway, Render, or another compatible Node.js hosting provider.
- PostgreSQL: Managed PostgreSQL database.

Verify current deployment compatibility and platform requirements before selecting the final deployment path.

Do not assume that a provider's free tier, database quota, or persistent-storage capabilities are available without checking.

### Dependency compatibility

Before installation, verify the current stable versions and peer-dependency compatibility of:

- Node.js.
- Next.js.
- React.
- NestJS.
- Prisma CLI.
- Prisma Client.
- PostgreSQL driver and Prisma PostgreSQL adapter.
- Tiptap packages.
- Tailwind CSS.
- Jest and Playwright.

Use mutually compatible versions.

Do not blindly combine configuration instructions from different Prisma major versions.

Ensure Prisma client generation, adapter configuration, module formats, TypeScript imports, build output, and production initialization work together.

Avoid deprecated packages and APIs wherever practical.

---

# 3. REPOSITORY INSPECTION AND INITIALIZATION

Before changing anything:

1. Inspect the existing repository.
2. Determine whether a frontend or backend already exists.
3. Identify existing package.json files.
4. Inspect TypeScript configuration.
5. Check dependencies and lockfiles.
6. Review environment configuration.
7. Identify existing implementations that should be preserved.
8. Check Git status before editing.
9. Do not overwrite unrelated work.
10. Do not introduce unnecessary architectural changes.

If the repository is empty, initialize the complete application.

Use this logical structure:

```text
ajaia-docs/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── public/
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── documents/
│       │   ├── sharing/
│       │   ├── imports/
│       │   ├── prisma/
│       │   ├── common/
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── test/
│       ├── .env.example
│       └── package.json
│
├── tests/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── TESTING.md
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

Use a straightforward pnpm workspace. Avoid unnecessary monorepo tooling.

Only add infrastructure when it solves an actual requirement.

All commands must run from documented working directories.

---

# 4. PRODUCT DESIGN AND USER EXPERIENCE

Build a clean, modern, responsive document management application.

Visual direction:

- Minimal productivity-oriented interface.
- Light theme by default.
- White and subtle neutral backgrounds.
- Restrained accent color.
- Clear typography.
- Spacious but efficient layout.
- Subtle borders and hover interactions.
- Professional toolbar controls.
- Responsive pages.
- Accessible focus indicators.
- No unnecessary animations.
- No excessive decorative components.

The application should feel similar in usability to a simple Google Docs/Notion document workspace, without copying their branding.

## Required pages

### A. User Selection / Login

Provide a practical demo authentication flow.

Use a small set of seeded demo accounts.

Example users:

- Alice — alice@ajaia.demo
- Bob — bob@ajaia.demo
- Charlie — charlie@ajaia.demo

Users must be able to switch between demo accounts through a deliberate login/logout flow.

**Do not identify the current user solely through an editable client-side user ID, email, localStorage value, or unverified request header.**

Use a lightweight but server-validated demo session. A signed, HttpOnly cookie or similarly secure approach is acceptable.

The application should clearly state that these are demonstration accounts rather than production authentication.

For deployment, use a bounded demonstration setup with no sensitive real user data. Disable public registration unless explicitly implemented and secured.

### B. Dashboard

The dashboard must contain:

- Application name/logo.
- Current user identification.
- Logout or account switching.
- New Document button.
- Import Document action.
- Owned Documents section.
- Shared With Me section.
- Document title.
- Last modified date.
- Owner name for shared documents.
- Clear empty states.
- Open document action.
- Rename action where permitted.
- Share action for owned documents.
- Delete action for owned documents.

Use a responsive document card/grid or compact list.

Clearly distinguish:

1. Documents owned by the logged-in user.
2. Documents shared with the logged-in user.

Do not expose inaccessible documents in either list.

### C. Document Editor

Provide an editor page such as:

`/documents/[documentId]`

The page must include:

- Editable document title for owners.
- Rich-text toolbar.
- Rich-text editing surface.
- Visible save status.
- Back-to-dashboard navigation.
- Share button where permitted.
- Owner information.
- Clear viewer/editor permissions.
- Loading and error states.

Keep the editing flow simple and immediately understandable.

### D. Share Dialog

Include a share modal with:

- Document title.
- Current owner.
- Searchable/selectable eligible demo users.
- Ability for the owner to grant access.
- Shared users list.
- Permission labels.
- Ability for the owner to revoke access.
- Clear feedback on success and failure.

Do not implement email invitations or email delivery unless core requirements are finished and there is adequate time.

---

# 5. DATABASE DESIGN — PRISMA

Implement a consistent relational data model.

## User

Fields:

- id: UUID, primary key.
- name: string.
- email: unique string.
- createdAt: DateTime.
- updatedAt: DateTime.

Relations:

- Owned documents.
- Document shares.

## Document

Fields:

- id: UUID, primary key.
- title: string.
- content: JSON.
- ownerId: UUID foreign key.
- version: integer, default 1.
- createdAt: DateTime.
- updatedAt: DateTime.

Relations:

- Owner.
- Document shares.

Document content should use Tiptap-compatible structured JSON.

Do not store only plain text because formatting must survive persistence.

Define a safe initial empty document structure.

## DocumentShare

Fields:

- id: UUID, primary key.
- documentId: UUID.
- userId: UUID.
- permission: enum.
- createdAt: DateTime.

Permissions:

- VIEW.
- EDIT.

Add a database-level unique constraint for the combination of documentId and userId.

Relations:

- Document.
- User.

Use appropriate foreign keys and cascade behavior.

Deleting a document must remove its sharing records.

Deleting a share must not delete the underlying document.

A document cannot be shared with its own owner.

Duplicate shares must not be created.

## Permission rules

The owner has full control.

EDIT users may:

- Open the document.
- Read document content.
- Edit and save document content.

VIEW users may:

- Open the document.
- Read document content.

VIEW users may not edit or save document content.

Only owners may:

- Rename a document.
- Delete a document.
- Grant sharing access.
- Revoke sharing access.
- Change sharing permissions.

These restrictions must be enforced on the backend, not only through disabled UI controls.

Do not allow a shared user to transfer ownership.

Ownership transfer is outside the scope.

## Database requirements

- Use PostgreSQL.
- Use Prisma migrations.
- Use valid relational constraints.
- Use proper indexes.
- Use Prisma-generated types.
- Avoid unnecessary raw SQL.
- Add deterministic seed scripts.
- Document migration and seeding commands.
- Separate development, testing, and production configuration.
- Never use destructive development migration commands against production.

Ensure Prisma's runtime adapter, environment loading, generated client output, and migration commands are compatible with the installed Prisma version.

Use database transactions where multiple related writes must succeed or fail together.

---

# 6. DOCUMENT CREATION AND MANAGEMENT

Implement full document lifecycle behavior.

## Create Document

When the user selects New Document:

1. Send a request to NestJS.
2. Create a document owned by the authenticated user.
3. Assign a default title such as "Untitled Document".
4. Initialize valid empty rich-text content.
5. Persist the document in PostgreSQL.
6. Return the created document ID.
7. Navigate to the editor.

Do not rely on temporary frontend-only document objects.

The created document must be immediately retrievable by ID.

## Rename Document

Allow document owners to rename documents.

Requirements:

- Trim whitespace.
- Reject empty titles.
- Set a sensible maximum length, such as 150 characters.
- Display validation errors clearly.
- Persist the change.
- Update dashboard information.
- Prevent unauthorized renames.

## Delete Document

Only the owner may delete a document.

Requirements:

- Display a confirmation dialog.
- Use backend authorization.
- Delete relevant sharing relationships through defined database behavior.
- Prevent non-owner deletion.
- Redirect to the dashboard after successful deletion.
- Handle missing or already-deleted documents.
- Avoid deleting other documents.

## Open and Reopen

A document must reopen with:

- Correct title.
- Correct rich-text content.
- Correct formatting.
- Correct owner.
- Correct sharing permissions.
- Correct saved state.

Documents must remain available after refreshing the browser and restarting the application.

---

# 7. RICH-TEXT EDITOR

Use Tiptap.

Implement the following features:

1. Plain paragraph text.
2. Bold.
3. Italic.
4. Underline.
5. Heading 1.
6. Heading 2.
7. Heading 3, if easily supported.
8. Bulleted lists.
9. Numbered lists.
10. Undo.
11. Redo.

The toolbar must be fully functional.

Each button should:

- Perform its action.
- Reflect active formatting where appropriate.
- Be disabled when unavailable.
- Have an accessible name or tooltip.
- Work with keyboard interaction where practical.

Use the required Tiptap extensions.

Avoid duplicate extension registration when using StarterKit.

Check current extension APIs because Tiptap package interfaces can change.

## Next.js rendering

Tiptap must be initialized in a client component.

Prevent server-side hydration mismatches.

Use the officially supported configuration for the installed Tiptap version, including `immediatelyRender: false` where appropriate.

Do not access browser-only APIs during server rendering.

## Content persistence

Use Tiptap JSON as the canonical stored format.

When saving:

1. Read editor content using the supported JSON API.
2. Validate the content structure.
3. Send it to NestJS.
4. Validate the request again on the backend.
5. Store JSON through Prisma.
6. Return the updated document version.

When reopening:

1. Fetch the document from NestJS.
2. Populate the editor using the stored JSON.
3. Preserve formatting and content structure.
4. Avoid overwriting previously saved content during editor initialization.

Do not convert JSON into plain text during save operations.

Do not blindly use dangerouslySetInnerHTML to render arbitrary uploaded or user-supplied HTML.

Only allow supported, sanitized rich-text structures.

## Read-only documents

If the user has VIEW permission:

- Disable editing.
- Hide or disable formatting controls.
- Disable saving.
- Keep document content visible.
- Display a clear read-only label.

Backend authorization must independently reject attempts to save.

---

# 8. AUTOSAVE AND UNSAVED-CHANGE HANDLING

Implement a simple, reliable autosave system if it can be completed within the timebox.

Recommended behavior:

- Save after approximately 800–1200 ms of editing inactivity.
- Use a debounced save mechanism.
- Display save status.
- Avoid a network request on every keystroke.
- Avoid saving unchanged content.
- Prevent concurrent save requests from corrupting state.

Use save indicators:

- Saving…
- Saved
- Unsaved changes
- Save failed

When a save fails:

- Show the error.
- Keep unsaved editor content intact.
- Offer Retry Save.
- Never claim a successful save.

## Save concurrency

Use the document's integer `version` for optimistic concurrency.

A save request should contain:

- Updated content.
- Expected document version.

Only accept the save if the stored version matches.

On successful content modification:

- Increment version.
- Update updatedAt.
- Return the new version.

Use an atomic conditional database update or equivalent transaction-safe logic.

If two sessions edit the same document simultaneously, do not silently overwrite newer content.

Return HTTP 409 for version conflicts.

The frontend should preserve local unsaved content and provide an understandable conflict message with a safe option to reload the latest version.

Do not implement CRDT-based live collaboration unless the mandatory MVP is complete.

## Navigation safety

If the user navigates away with unsaved changes, provide appropriate protection or feedback.

Avoid falsely promising that a browser unload handler can always finish an asynchronous save.

If a save remains pending during navigation, retain the unsaved state where feasible or warn the user.

Test that fast navigation does not unexpectedly destroy document changes.

---

# 9. FILE UPLOAD / DOCUMENT IMPORT

Implement document import as the required file-upload workflow.

To keep scope manageable, support:

- `.txt`
- `.md`

Importing `.docx` is optional and must not delay delivery of the core product.

Clearly state supported types in the UI and README.

## Import behavior

When a user selects Import Document:

1. Open a file selector.
2. Restrict the accepted extensions in the UI.
3. Send the file to NestJS using multipart/form-data.
4. Validate the uploaded file on the server.
5. Parse its text content.
6. Convert it to supported Tiptap JSON.
7. Create a new document.
8. Assign the current user as owner.
9. Derive the document title from the sanitized filename.
10. Save the imported document.
11. Open it in the rich-text editor.

## TXT behavior

Preserve paragraph breaks and line breaks reasonably.

Escape or safely represent special characters.

Do not interpret `.txt` content as HTML.

## Markdown behavior

Support common Markdown syntax where practical:

- Headings.
- Paragraphs.
- Bold.
- Italic.
- Bulleted lists.
- Numbered lists.

Convert Markdown to the allowed editor structure through a safe parser/conversion process.

Do not assume all Markdown features are supported.

Document any intentionally unsupported Markdown constructs.

## Upload security

Implement:

- Maximum file size: 2 MB.
- Maximum one file per import request.
- Extension validation.
- MIME/content sanity checks.
- UTF-8 decoding checks.
- Empty-file handling.
- Invalid-file error responses.
- Safe filename handling.
- Rejection of unsupported formats.

Do not trust extensions or browser-provided MIME types alone.

Do not execute uploaded files or embed uploaded scripts.

Do not require permanent file storage for the import workflow.

Read and convert the file, persist the resulting document content, and avoid retaining unnecessary uploads.

If import processing fails, avoid leaving behind a malformed or partially created document.

## Import test cases

Test:

- Valid TXT.
- Valid Markdown.
- Empty TXT.
- Unsupported PDF.
- Unsupported DOCX.
- Renamed binary file.
- File larger than 2 MB.
- Filename with special characters.
- Multiple upload attempts.
- Imported formatting after refresh.
- Ownership of imported documents.
- Unauthorized requests.

---

# 10. DOCUMENT SHARING

Implement complete owner-controlled sharing.

## Sharing flow

A document owner can:

1. Open Share.
2. Select another existing user.
3. Select VIEW or EDIT permission.
4. Confirm sharing.
5. See the user in the current access list.

The recipient can:

1. Log in using their demo account.
2. Navigate to Shared With Me.
3. See the shared document.
4. Open the document.
5. Interact according to their permission.

## Permission changes

Owners should be able to change VIEW to EDIT and EDIT to VIEW.

Changes must persist and be reflected in the UI.

Permission updates must apply to subsequent authorized requests.

## Revocation

Owners must be able to revoke access.

After revocation:

- The recipient cannot fetch the protected document.
- The recipient cannot save content.
- The document disappears from Shared With Me after refresh.
- A currently open editor must handle future authorization failures appropriately.

## Sharing validation

Reject:

- Sharing with self.
- Sharing with nonexistent users.
- Duplicate grants.
- Invalid permission values.
- Unauthorized sharing attempts.
- Unauthorized revocation attempts.

Do not expose documents based solely on knowledge of their IDs.

Document IDs are identifiers, not authorization credentials.

## Authentication boundary

All protected API endpoints must derive the authenticated user from the validated server-side session.

Never trust `ownerId`, `userId`, or access level supplied by the client as proof of authorization.

If a request includes a target user ID for sharing, verify that the caller owns the document before granting access.

---

# 11. BACKEND MODULE STRUCTURE

Use NestJS modules with clear responsibilities.

## Auth Module

Responsible for:

- Demo login.
- Session validation.
- Current-user resolution.
- Logout.
- Authentication guard.

## Users Module

Responsible for:

- Fetching the current user.
- Listing users eligible for sharing.
- Basic user lookup.

## Documents Module

Responsible for:

- Creating documents.
- Listing owned documents.
- Listing shared documents.
- Fetching documents.
- Renaming.
- Updating content.
- Deleting.
- Ownership checks.
- Version conflict handling.

## Sharing Module

Responsible for:

- Creating shares.
- Listing document shares.
- Updating permissions.
- Revoking shares.
- Sharing authorization.

## Imports Module

Responsible for:

- Receiving uploads.
- Validating files.
- Parsing TXT/Markdown.
- Converting content.
- Creating imported documents.

## Prisma Module

Responsible for:

- Prisma client initialization.
- Database connectivity.
- Dependency injection.
- Resource cleanup.

Keep controllers thin.

Business logic belongs in services.

Do not place substantial business logic inside Next.js page components.

Avoid duplicated authorization logic.

Create reusable guards/helpers where appropriate.

---

# 12. REST API CONTRACT

Use a consistent API prefix:

`/api/v1`

Implement or equivalently map the following endpoints.

## Authentication

`POST /api/v1/auth/demo-login`

Input:

```json
{
  "userId": "valid-seeded-user-uuid"
}
```

Returns a demo session and public user information.

The server must validate that the selected demo account exists and is allowed for this deployment.

`POST /api/v1/auth/logout`

Invalidates/clears the demo session.

`GET /api/v1/auth/me`

Returns authenticated user information.

## Users

`GET /api/v1/users`

Returns users eligible for sharing, excluding sensitive session information.

## Documents

`POST /api/v1/documents`

Creates a new document.

`GET /api/v1/documents?scope=owned`

Returns owned documents.

`GET /api/v1/documents?scope=shared`

Returns accessible shared documents.

`GET /api/v1/documents/:id`

Returns a document only when authorized.

`PATCH /api/v1/documents/:id/title`

Renames a document. Owner only.

`PATCH /api/v1/documents/:id/content`

Updates structured content using optimistic concurrency.

Example payload:

```json
{
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Hello Ajaia"
          }
        ]
      }
    ]
  },
  "expectedVersion": 1
}
```

`DELETE /api/v1/documents/:id`

Deletes a document. Owner only.

## Sharing

`GET /api/v1/documents/:id/shares`

Owner-only sharing management endpoint.

`POST /api/v1/documents/:id/shares`

Creates sharing access.

`PATCH /api/v1/documents/:id/shares/:shareId`

Updates permission.

`DELETE /api/v1/documents/:id/shares/:shareId`

Revokes permission.

## Import

`POST /api/v1/documents/import`

Receives multipart/form-data containing the file.

Returns the created document information.

## Health

`GET /api/v1/health`

Returns basic application health.

Do not expose secrets or database credentials.

For deployment readiness, include a database connectivity check where appropriate.

## Response conventions

Use conventional HTTP statuses:

- 200: successful read/update.
- 201: successful creation.
- 204: successful deletion where no response body is returned.
- 400: invalid input.
- 401: unauthenticated request.
- 403: insufficient permissions.
- 404: nonexistent or intentionally concealed resource.
- 409: duplicate/conflicting operation or version conflict.
- 413: oversized upload.
- 415: unsupported file type.
- 500: unexpected server error.

Use consistent error response shapes.

Do not expose Prisma internals, database stack traces, or secrets to clients.

---

# 13. FRONTEND IMPLEMENTATION

Build reusable components.

Suggested components:

```text
components/
├── layout/
│   ├── AppHeader.tsx
│   └── PageContainer.tsx
├── documents/
│   ├── DocumentCard.tsx
│   ├── DocumentList.tsx
│   ├── DocumentEditor.tsx
│   ├── EditorToolbar.tsx
│   ├── SaveStatus.tsx
│   └── RenameDocumentDialog.tsx
├── sharing/
│   └── ShareDialog.tsx
├── imports/
│   └── ImportDocumentDialog.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── EmptyState.tsx
    └── LoadingState.tsx
```

Adapt this structure if a simpler implementation is more maintainable.

## UX requirements

Every important action needs:

- Loading indication where necessary.
- Success feedback.
- Error feedback.
- Appropriate disabled states.
- Accessible labels.
- Keyboard usability.
- Permission-aware controls.

The frontend must never rely on UI visibility alone for access control.

## API communication

Use a shared typed API client.

Do not scatter hardcoded API URLs across components.

Use environment configuration.

Handle:

- Network failures.
- Non-2xx HTTP responses.
- Session expiry.
- Invalid responses.
- Request cancellation where needed.
- Rapid document navigation.
- Concurrent saves.

If using cross-origin cookie sessions, configure allowed origins, credentialed requests, cookies, and CSRF protection correctly.

Prefer straightforward, secure deployment routing where possible.

Do not use wildcard CORS with credentialed requests.

## Responsive requirements

Test at least:

- Desktop: 1440 px.
- Tablet: 768 px.
- Mobile: 375 px.

The editor and toolbar should remain usable on smaller screens.

A horizontally scrollable toolbar is acceptable if accessible and visually intentional.

Avoid viewport overflow and hidden critical buttons.

---

# 14. VALIDATION AND SECURITY

Implement meaningful defensive validation.

## Input validation

Validate:

- Document titles.
- UUID route parameters.
- Document content.
- Maximum request sizes.
- File uploads.
- Sharing targets.
- Permission enums.
- Session credentials.
- Document version numbers.

Enable global NestJS validation with appropriate settings, such as:

- whitelist.
- forbidNonWhitelisted.
- transform.

Avoid blindly accepting arbitrary nested JSON as valid editor content.

Validate supported Tiptap node types, mark types, nesting depth, and reasonable content size.

## Authorization

Enforce ownership and sharing access in every relevant service operation.

Explicitly test unauthorized:

- Read.
- Update.
- Rename.
- Delete.
- Share.
- Permission modification.
- Revocation.

## Cross-site scripting

Do not allow arbitrary executable HTML in imported files or editor content.

Prefer safe structured JSON and explicit supported nodes.

If rendering HTML is necessary, sanitize it using an appropriate maintained library.

## CSRF and session security

If cookie-based authentication is used:

- HttpOnly cookies.
- Appropriate SameSite settings.
- Secure cookies in production.
- Signed or verifiable session values.
- Expiration.
- Logout invalidation where applicable.
- CSRF defense for state-changing requests.
- Controlled CORS.

A demo login is acceptable for the assignment, but explicitly document that choosing a demo identity is not production authentication.

Do not expose the application as if the seeded identities were secure real-user accounts.

## Environment security

- Never commit real `.env` files.
- Never expose database connection strings to the browser.
- Never put private backend secrets in NEXT_PUBLIC variables.
- Use `.env.example` templates.
- Add clear startup errors for missing required environment variables.

---

# 15. DATABASE SEEDING

Create deterministic seed data.

Required users:

- Alice.
- Bob.
- Charlie.

Seed at least:

- One document owned by Alice.
- One document owned by Bob.
- One document Alice shares with Bob as EDIT.
- One document Alice shares with Charlie as VIEW.
- One unshared private document.

Use representative rich-text content.

Test seeding multiple times to ensure it does not create duplicate records.

Use upsert or other idempotent logic.

Document whether development seeding is permitted in each environment.

Avoid destructive production reseeding.

---

# 16. AUTOMATED TESTING — MANDATORY

Create actual automated tests.

Do not merely write a checklist and claim testing is complete.

Testing should be risk-focused, with maximum coverage of mandatory workflows.

Use isolated test data.

Do not point tests at production data.

## Backend tests

Test the following.

### Document creation

- Authenticated user creates a document.
- Owner is correctly assigned.
- Default title is correct.
- Empty rich-text structure is valid.
- Document persists.
- Unauthenticated creation is rejected.

### Document retrieval

- Owner can retrieve their document.
- EDIT recipient can retrieve a shared document.
- VIEW recipient can retrieve a shared document.
- Unauthorized user cannot retrieve a private document.
- Nonexistent document returns the appropriate error.

### Document update

- Owner can save content.
- EDIT recipient can save content.
- VIEW recipient cannot save content.
- Unauthorized user cannot save.
- Formatting survives save.
- Version increases after successful save.
- Incorrect expectedVersion returns 409.
- Conflict does not overwrite newer content.

### Rename

- Owner can rename.
- Recipient cannot rename.
- Empty title is rejected.
- Excessively long title is rejected.
- Valid title persists.

### Delete

- Owner can delete.
- Recipient cannot delete.
- Unauthorized user cannot delete.
- Deletion removes related shares.
- Other documents remain intact.

### Sharing

- Owner can create a share.
- Recipient can access after sharing.
- Duplicate share is rejected.
- Sharing with self is rejected.
- Unknown recipient is rejected.
- Non-owner cannot share.
- Owner can change VIEW to EDIT.
- Owner can change EDIT to VIEW.
- Owner can revoke access.
- Revoked user loses access.
- Revoked user cannot save through a stale editor.
- Another user's shares remain unaffected.

### File import

- Valid TXT import.
- Valid Markdown import.
- Imported document has the correct owner.
- Valid formatting persists.
- Invalid extension is rejected.
- Oversized file is rejected.
- Invalid binary data is rejected.
- Empty file behavior is correct.
- Failed import does not create malformed data.

### Authentication

- Valid seeded user can sign in.
- Invalid demo user is rejected.
- Missing session is rejected.
- Tampered session is rejected.
- Logout invalidates access.
- Privileges cannot be changed through a forged header.

## Unit tests

At minimum, implement focused tests for:

1. Permission resolution.
2. Markdown/TXT conversion.
3. Document validation.
4. Version conflict logic, where practical.

Use mocking only where appropriate.

Do not substitute mocked tests for all database behavior.

## Integration tests

Run real database-backed API tests using a separate PostgreSQL test database.

At minimum:

- Document creation and readback.
- Content persistence.
- Ownership restrictions.
- Share creation and revocation.
- Version conflict handling.

Ensure tests are isolated and repeatable.

## Browser E2E tests

Use Playwright.

Test the complete user journey.

### Scenario 1: Document lifecycle

1. Open the application.
2. Log in as Alice.
3. Create a document.
4. Enter a title.
5. Enter formatted content.
6. Apply bold.
7. Apply italic.
8. Apply underline.
9. Insert a heading.
10. Insert a bulleted list.
11. Insert a numbered list.
12. Save.
13. Refresh the browser.
14. Verify title and formatting remain.
15. Return to dashboard.
16. Reopen the document.
17. Verify persisted content.

### Scenario 2: Sharing

1. Alice creates a document.
2. Alice shares it with Bob using EDIT.
3. Log out Alice.
4. Log in as Bob.
5. Verify the document appears under Shared With Me.
6. Open the shared document.
7. Edit the content.
8. Save.
9. Log out Bob.
10. Log in as Alice.
11. Verify Bob's edits appear.

### Scenario 3: View-only access

1. Alice shares a document with Charlie using VIEW.
2. Log in as Charlie.
3. Open the document.
4. Verify content is visible.
5. Verify editing controls are disabled.
6. Attempt an unauthorized API update.
7. Verify the server rejects it.

### Scenario 4: Revocation

1. Alice revokes Bob's access.
2. Log in as Bob.
3. Verify the document is no longer listed.
4. Attempt to open the previous document URL.
5. Verify access is denied.

### Scenario 5: Import

1. Log in as Alice.
2. Import a valid Markdown file.
3. Verify a new document is created.
4. Verify imported formatting.
5. Edit imported content.
6. Save.
7. Refresh.
8. Verify persistence.

### Scenario 6: Validation

1. Attempt an empty title.
2. Attempt invalid uploads.
3. Test unauthorized API requests.
4. Test duplicate sharing.
5. Verify appropriate feedback.

### Scenario 7: Version conflict

1. Open a document in two independent sessions.
2. Save an edit in session A.
3. Attempt to save a stale edit in session B.
4. Verify session B receives conflict feedback.
5. Verify session A's saved content is not overwritten.

Ensure tests use deterministic selectors and do not depend on arbitrary sleep calls.

---

# 17. MANUAL AND BROWSER VERIFICATION

After automated testing, perform manual browser verification if a browser-capable environment is available.

Inspect:

- Initial page rendering.
- Login flow.
- Dashboard.
- Document creation.
- Editor functionality.
- Formatting toolbar.
- Autosave indicators.
- Import dialog.
- Share dialog.
- Owned/shared distinctions.
- Read-only mode.
- Delete confirmation.
- Error messages.
- Navigation.
- Mobile layout.
- Loading states.
- Empty states.

Check browser console output.

Investigate:

- Hydration warnings.
- React key warnings.
- Failed network calls.
- Unhandled promise rejections.
- Missing assets.
- JavaScript runtime errors.
- Infinite rendering loops.
- Stale editor state.
- Incorrect button behavior.

Do not mark visual testing as complete if no browser was actually opened.

---

# 18. BUILD, TYPE, LINT, AND PACKAGE VERIFICATION

After implementation, perform a complete package and project audit.

## Package audit

Inspect:

- Root package.json.
- Frontend package.json.
- Backend package.json.
- pnpm lockfile.
- Workspace configuration.
- Installed dependencies.
- Dev dependencies.
- Peer dependencies.
- Package scripts.
- Prisma generation scripts.
- Testing scripts.

Identify and correct:

- Missing packages.
- Incorrect package versions.
- Unused dependencies.
- Incompatible peer dependencies.
- Incorrect TypeScript types.
- Missing NestJS modules.
- Missing Tiptap extensions.
- Missing Postgres drivers.
- Missing Prisma driver adapter.
- Missing test dependencies.
- Incorrect package imports.
- Incorrect script paths.
- Missing environment variable declarations.

Do not install unrelated packages.

Choose compatible package versions instead of suppressing errors.

## Required commands

Provide and execute working equivalents of:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:e2e
```

Verify the exact commands exist in package.json.

If custom workspace filters are required, document them.

Verify:

- Next.js production build.
- NestJS production build.
- Prisma generation.
- Database migration.
- Seed command.
- Production startup command.

Run a clean installation/build where feasible.

Do not treat a successful development server startup as proof of a successful production build.

## Prisma verification

Check specifically:

- Prisma CLI/Client version consistency.
- Correct generator provider.
- Correct generated-client path.
- Appropriate module format.
- Valid datasource provider.
- Correct PostgreSQL adapter.
- Correct environment loading.
- Migration correctness.
- Production migration command.
- Import path correctness.
- Runtime connectivity.

Fix errors before moving to final verification.

---

# 19. ERROR HANDLING AND FAILURE RECOVERY

Handle failures deliberately.

## Database unavailable

- Backend should report a meaningful startup or readiness failure.
- Avoid accepting operations that cannot persist data.
- Do not silently fall back to in-memory storage.

## Backend unavailable

- Frontend should show a network/service error.
- Prevent silent document loss.
- Allow users to retry supported operations.

## Session expired

- Clear protected frontend state appropriately.
- Redirect to login when necessary.
- Do not leak protected document data into another session.

## Failed save

- Preserve editor content.
- Show Save failed.
- Provide retry behavior.
- Do not replace local content with stale server content automatically.

## Invalid upload

- Explain why the file failed.
- Do not crash the server.
- Do not create an invalid document.

## Missing document

- Render a proper not-found or inaccessible state.
- Avoid an infinite loading screen.

## Sharing failure

- Do not optimistically display access as granted unless the backend confirms success.
- Provide understandable errors.

## Permission revoked during editing

- Reject unauthorized saving.
- Inform the user.
- Do not misrepresent the document as saved.
- Do not expose additional content from newly unauthorized fetches.

## Concurrent edits

- Prevent silent last-write-wins data loss.
- Detect version conflicts.
- Keep unsaved local content safe for the current session.
- Document the limitation that changes are not merged in real time.

---

# 20. DEPLOYMENT REQUIREMENTS

The assignment requires a publicly accessible application.

Prepare and perform deployment if credentials and hosting access are available.

## Frontend deployment

Deploy Next.js to a compatible provider, preferably Vercel.

Check:

- Build command.
- Root directory.
- Environment variables.
- Server rendering.
- API connectivity.
- Authentication cookies.
- Production URLs.
- Browser console.
- Responsive interface.

## Backend deployment

Deploy NestJS to a suitable Node.js host.

Check:

- Build command.
- Runtime Node version.
- Start command.
- PORT binding.
- Environment configuration.
- CORS.
- Database connectivity.
- Prisma client generation.
- Production migrations.
- Health endpoint.
- HTTPS routing.

## PostgreSQL deployment

Use managed PostgreSQL with persistent storage.

Check:

- Database credentials.
- Connection URL.
- SSL requirements.
- Prisma adapter compatibility.
- Connection pooling where necessary.
- Migration permissions.
- Correct production schema.

Do not reset production data.

## Deployment validation

After deployment:

1. Open the deployed frontend.
2. Verify login.
3. Create a document.
4. Save content.
5. Refresh.
6. Verify persistence.
7. Import a file.
8. Share with another demo account.
9. Verify the recipient sees the document.
10. Verify permissions.
11. Test an invalid request.
12. Verify logout.
13. Check frontend and backend logs.
14. Verify no critical browser console errors.

A deployment is complete only when the deployed application passes the applicable smoke tests.

If deployment credentials, provider access, or required services are unavailable, do not claim that deployment succeeded.

Prepare deployment-ready configuration and document the precise remaining steps and blocker.

Do not invent deployment URLs.

---

# 21. README AND TECHNICAL DOCUMENTATION

Create a comprehensive but concise README.

It must contain:

## Product overview

- What Ajaia Docs does.
- Who it is designed for.
- Main capabilities.

## Features

- Document creation.
- Rename.
- Rich-text editing.
- Autosave/persistence.
- File import.
- Sharing.
- Permissions.
- Owned/shared dashboard.

## Architecture

Explain:

- Next.js responsibilities.
- NestJS responsibilities.
- Prisma responsibilities.
- PostgreSQL responsibilities.
- Authentication approach.
- Document JSON storage.
- Sharing permissions.
- API request flow.

## Setup instructions

Provide working commands for:

- Installing dependencies.
- Creating environment files.
- Configuring PostgreSQL.
- Running Prisma migrations.
- Generating Prisma Client.
- Seeding demo users.
- Starting frontend.
- Starting backend.
- Running tests.
- Building for production.

Include prerequisites and expected ports.

## Demo instructions

Document:

- Demo accounts.
- How to log in.
- How to create documents.
- How to format text.
- How to import files.
- How to share.
- How to switch users.
- How to test viewer/editor access.

## File support

Explicitly document:

- Supported extensions.
- 2 MB maximum size.
- Import conversion behavior.
- Unsupported formats.

## Architecture decisions

Explain important tradeoffs.

For example:

- Chose Tiptap instead of building a custom editor.
- Chose structured JSON for formatting persistence.
- Chose Prisma/PostgreSQL for relational consistency.
- Chose demo sessions instead of full authentication.
- Chose document sharing instead of real-time co-editing.
- Chose optimistic concurrency to protect against silent overwrites.
- Chose TXT/Markdown imports to meet upload requirements efficiently.

## Known limitations

Accurately document any remaining limitations.

Never claim that real-time collaboration exists when only shared access exists.

## Test instructions

Document:

- Unit test commands.
- Integration test commands.
- E2E test commands.
- Required test environment.
- Test database setup.
- Browser test dependencies.

## Deployment

Include:

- Frontend URL, if successfully deployed.
- Backend URL, if successfully deployed.
- Hosting details.
- Required environment variables.
- Deployment steps.

## Submission summary

Briefly explain what was prioritized and why.

---

# 22. REQUIRED DEVELOPMENT ORDER

Follow this sequence.

Do not randomly implement isolated UI components before establishing persistence and authorization.

### Phase 0 — Repository and environment audit

Tasks:

- Inspect repository.
- Check installed tooling.
- Verify compatible versions.
- Confirm workspace structure.
- Identify existing code.
- Establish development scripts.

Exit criteria:

- Frontend starts.
- Backend starts.
- PostgreSQL is reachable.
- Dependency installation succeeds.

### Phase 1 — Database and authentication

Tasks:

- Create Prisma schema.
- Configure Prisma.
- Run migration.
- Seed demo users.
- Implement demo sessions.
- Implement current-user endpoint.
- Protect authenticated routes.

Exit criteria:

- Users exist in PostgreSQL.
- Login works.
- Sessions are validated on the server.
- Unauthenticated protected requests fail.

### Phase 2 — Document CRUD

Tasks:

- Create documents.
- List owned documents.
- Fetch documents.
- Rename documents.
- Delete documents.
- Enforce ownership.
- Persist content.

Exit criteria:

- Documents remain after refresh.
- Ownership rules work.
- CRUD tests pass.

### Phase 3 — Rich-text editor

Tasks:

- Install Tiptap packages.
- Build toolbar.
- Implement structured JSON storage.
- Implement save.
- Implement read-only behavior.
- Implement safe autosave.
- Implement version conflicts.

Exit criteria:

- All required formatting works.
- Content survives refresh.
- Read-only access cannot save.
- Stale updates cannot silently overwrite data.

### Phase 4 — Sharing

Tasks:

- Create sharing APIs.
- Implement VIEW/EDIT permissions.
- Implement share modal.
- Display owned/shared sections.
- Enable permission changes.
- Enable revocation.

Exit criteria:

- Owner can grant/revoke access.
- Recipient sees shared documents.
- API permissions are enforced.
- Revocation works.

### Phase 5 — File import

Tasks:

- Implement upload API.
- Validate file type/size.
- Parse TXT.
- Parse Markdown.
- Convert to editor JSON.
- Persist imported document.
- Implement import UI.

Exit criteria:

- TXT works.
- Markdown works.
- Invalid uploads fail safely.
- Imported content survives refresh.

### Phase 6 — UI refinement

Tasks:

- Responsive layout.
- Loading states.
- Empty states.
- Toast/error feedback.
- Accessible controls.
- Visual consistency.

Exit criteria:

- App usable on desktop/mobile.
- No broken navigation.
- Core actions understandable.

### Phase 7 — Testing and repair

Tasks:

- Backend tests.
- Database integration tests.
- Browser E2E tests.
- Typecheck.
- Lint.
- Production build.
- Dependency audit.
- Bug fixes.

Exit criteria:

- Required tests pass.
- Builds succeed.
- No known critical defects in core workflows.

### Phase 8 — Deployment and documentation

Tasks:

- Prepare deployment configuration.
- Deploy where credentials permit.
- Run production smoke tests.
- Finish README.
- Finish architecture notes.
- Report actual results.

Exit criteria:

- Deployment is verified if platform access is available.
- Documentation is complete.
- Known blockers are disclosed.

---

# 23. TIME MANAGEMENT

The assignment allows a maximum of 4–6 hours.

Target this allocation:

| Phase | Target time |
|---|---:|
| Environment, scaffolding, Prisma | 35 minutes |
| Demo login and document CRUD | 60 minutes |
| Rich-text editor and persistence | 65 minutes |
| Sharing and permissions | 50 minutes |
| File import | 35 minutes |
| UI refinement | 25 minutes |
| Testing and debugging | 50 minutes |
| Deployment, README, verification | 40 minutes |
| **Total** | **360 minutes** |

These are planning targets, not a claim that implementation will definitely finish within those intervals.

At every phase, preserve a working build.

Prioritize P0 tasks.

If time runs short:

- Do not remove required authorization.
- Do not skip persistence.
- Do not fake tests.
- Do not misrepresent deployment.
- Do not implement unnecessary advanced features.
- Reduce styling complexity before sacrificing functional correctness.
- Preserve a demonstrable end-to-end journey.
- Report unfinished work honestly when the deadline arrives.

Do not proceed beyond the six-hour cap.

---

# 24. FINAL ACCEPTANCE CHECKLIST

Before declaring completion, verify all of the following.

## Product

- [ ] Demo login works.
- [ ] Logout works.
- [ ] User switching works.
- [ ] Dashboard loads.
- [ ] Owned documents appear.
- [ ] Shared documents appear.
- [ ] Document creation works.
- [ ] Document rename works.
- [ ] Document deletion works.
- [ ] Rich-text editing works.
- [ ] Bold works.
- [ ] Italic works.
- [ ] Underline works.
- [ ] Headings work.
- [ ] Bulleted lists work.
- [ ] Numbered lists work.
- [ ] Undo/redo work.
- [ ] Saving works.
- [ ] Save indicators reflect reality.
- [ ] Refresh preserves content.
- [ ] Reopening documents works.
- [ ] File upload works.
- [ ] TXT import works.
- [ ] Markdown import works.
- [ ] Invalid imports are rejected.
- [ ] Sharing works.
- [ ] Permission updates work.
- [ ] Revocation works.
- [ ] Read-only mode works.
- [ ] Editor permission works.
- [ ] Unauthorized actions are rejected.
- [ ] Version conflicts are handled.
- [ ] Mobile layout is usable.

## Backend

- [ ] NestJS modules load.
- [ ] REST endpoints work.
- [ ] DTO validation works.
- [ ] Authentication guard works.
- [ ] Authorization works.
- [ ] Error handling works.
- [ ] Prisma initializes.
- [ ] Database connections work.
- [ ] Migration works.
- [ ] Seeding works.
- [ ] Document relationships work.
- [ ] Sharing relationships work.
- [ ] File validation works.
- [ ] Health endpoint works.

## Engineering

- [ ] No missing required packages.
- [ ] No unresolved imports.
- [ ] No unaddressed TypeScript errors.
- [ ] No known critical runtime errors.
- [ ] Lint passes.
- [ ] Frontend production build passes.
- [ ] Backend production build passes.
- [ ] Prisma Client generates.
- [ ] Automated tests pass.
- [ ] Relevant browser tests pass.
- [ ] Test results are accurately reported.
- [ ] Environment examples exist.
- [ ] README is accurate.
- [ ] Architecture note exists.
- [ ] Deployment configuration is documented.
- [ ] Production smoke tests pass if deployment occurred.

For each checklist item, record PASS, FAIL, BLOCKED, or NOT TESTED.

Never treat NOT TESTED as PASS.

---

# 25. FINAL OUTPUT FORMAT

At completion, provide a factual report.

### A. Implementation summary

Explain the features actually implemented.

### B. Architecture summary

Explain the final stack and important design choices.

### C. File and module summary

List major files/modules created or modified.

### D. Packages and dependencies

List important packages, version decisions, missing packages found, and corrective actions taken.

### E. Database

State whether:

- Migration completed.
- Seed completed.
- Database queries succeeded.
- Persistence was verified.

### F. Automated tests

Provide:

- Test suite names.
- Commands executed.
- Number passed.
- Number failed.
- Tests blocked or not executed.
- Relevant failure explanations.

Do not invent test numbers.

### G. Build verification

Report actual results for:

- Install.
- Lint.
- Typecheck.
- Frontend build.
- Backend build.
- Prisma generation.
- Database migration.

### H. Deployment

Provide verified public URLs if deployment succeeded.

Otherwise specify the exact deployment blocker and required action.

### I. Known limitations

Disclose incomplete items and intentional scope limits.

### J. Final acceptance matrix

Provide PASS/FAIL/BLOCKED/NOT TESTED status for every mandatory feature.

### K. Run instructions

Provide the exact commands needed to start and verify the project.

---

# 26. MANDATORY EXECUTION RULES

Follow these rules strictly.

1. Do not merely explain what should be developed. Implement it.
2. Do not provide pseudocode in place of required functional code.
3. Do not leave placeholder methods for mandatory features.
4. Do not implement frontend actions without corresponding working backend logic.
5. Do not pretend static/mock data is persisted data.
6. Do not rely on client-side authorization.
7. Do not leave buttons visually present but nonfunctional.
8. Do not silently ignore save errors.
9. Do not silently overwrite concurrent edits.
10. Do not introduce unsupported rich-text content.
11. Do not disable TypeScript strictness simply to hide errors.
12. Do not use `any` unnecessarily.
13. Do not suppress lint errors to conceal defects.
14. Do not install incompatible package versions.
15. Do not delete existing code without justification.
16. Do not make destructive database changes without examining their effects.
17. Do not expose credentials or secrets.
18. Do not claim tests passed unless actually executed.
19. Do not claim deployment succeeded without verifying the public application.
20. Do not exceed the assignment's time limit.
21. Do not add advanced collaboration features before mandatory features are reliable.
22. Fix root causes, not just visible symptoms.
23. When fixing one feature, verify that existing functionality still works.
24. Perform integration tests, not only isolated unit tests.
25. Keep implementation simple and maintainable.
26. Document material tradeoffs and deviations.
27. Use AI-generated code critically; verify correctness yourself through available tools.
28. If an external dependency or missing credential blocks completion, report the blocker precisely rather than inventing success.
29. Preserve a runnable project even when time expires.
30. Deliver the strongest verified working solution possible within the timebox.

---

# 27. FINAL INSTRUCTIONS TO CODEX

Begin immediately.

First inspect the repository and environment.

Then create a short implementation checklist and execute the phases in priority order.

Perform implementation through actual file edits and terminal commands.

After implementing each major phase:

1. Verify its functionality.
2. Investigate errors.
3. Correct the root causes.
4. Re-run relevant checks.
5. Continue only when the core workflow is stable, subject to the hard time limit.

After implementing all mandatory features:

1. Audit the dependency tree.
2. Find missing or incorrect packages.
3. Correct configuration issues.
4. Generate Prisma Client.
5. Validate PostgreSQL migrations.
6. Run frontend and backend.
7. Execute automated tests.
8. Exercise full user journeys.
9. Test access restrictions.
10. Fix discovered failures.
11. Re-run regression checks.
12. Build production artifacts.
13. Deploy where access permits.
14. Verify deployed behavior.
15. Complete README and architecture documentation.
16. Produce the evidence-based final report.

Your goal is not to write the most code.

Your goal is to deliver the most reliable, coherent, demonstrable full-stack product that satisfies the assignment within its constraints.

**Start implementation now.**
