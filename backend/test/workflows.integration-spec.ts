import 'reflect-metadata';
import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { DEMO_USERS } from '../src/auth/demo-users.js';
import { configureApp } from '../src/common/bootstrap.js';
import { EMPTY_CONTENT } from '../src/common/content.js';
config({ path: '.env.test' });
if (!process.env.TEST_DATABASE_URL)
  throw new Error(
    'TEST_DATABASE_URL is required; use a dedicated database or schema named ajaia_test',
  );
const testUrl = new URL(process.env.TEST_DATABASE_URL);
if (
  !testUrl.pathname.includes('test') &&
  !testUrl.searchParams.get('schema')?.startsWith('ajaia_test')
)
  throw new Error(
    'Refusing integration tests outside a dedicated test database/schema',
  );
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
process.env.FRONTEND_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
const header = { 'X-Ajaia-Request': '1', Origin: 'http://localhost:3000' };
let app: INestApplication;
let alice: ReturnType<typeof request.agent>;
let bob: ReturnType<typeof request.agent>;
let charlie: ReturnType<typeof request.agent>;
let docId: string;
let shareId: string;
const ids: string[] = [];
const path = (suffix = '') => `/api/v1/documents/${docId}${suffix}`;
beforeAll(async () => {
  execFileSync('pnpm', ['prisma:migrate'], { env: process.env, stdio: 'pipe' });
  execFileSync('pnpm', ['prisma:seed'], { env: process.env, stdio: 'pipe' });
  const { AppModule } = await import('../src/app.module.js');
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  configureApp(app);
  await app.init();
  alice = request.agent(app.getHttpServer());
  bob = request.agent(app.getHttpServer());
  charlie = request.agent(app.getHttpServer());
  for (const [agent, user] of [
    [alice, DEMO_USERS[0]],
    [bob, DEMO_USERS[1]],
    [charlie, DEMO_USERS[2]],
  ] as const)
    await agent
      .post('/api/v1/auth/demo-login')
      .set(header)
      .send({ userId: user.id })
      .expect(201);
}, 120000);
afterAll(async () => {
  if (!app) return;
  for (const id of ids)
    await alice.delete(`/api/v1/documents/${id}`).set(header);
  for (const agent of [alice, bob, charlie])
    await agent.post('/api/v1/auth/logout').set(header);
  await app.close();
});
describe('PostgreSQL authenticated document workflows', () => {
  it('checks database readiness', async () => {
    const r = await alice.get('/api/v1/health').expect(200);
    expect(r.body.database).toBe('connected');
  });
  it('rejects unauthenticated reads and forged sessions', async () => {
    await request(app.getHttpServer()).get('/api/v1/documents').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', 'ajaia_session=' + 'a'.repeat(64))
      .expect(401);
  });
  it('rejects cross-origin writes and missing CSRF header', async () => {
    await alice.post('/api/v1/documents').expect(403);
    await alice
      .post('/api/v1/documents')
      .set({ ...header, Origin: 'https://evil.example' })
      .expect(403);
  });
  it('restricts login to seeded demo accounts and rejects extra fields', async () => {
    await alice
      .post('/api/v1/auth/demo-login')
      .set(header)
      .send({ userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
      .expect(401);
    await alice
      .post('/api/v1/auth/demo-login')
      .set(header)
      .send({ userId: DEMO_USERS[0].id, ownerId: DEMO_USERS[1].id })
      .expect(400);
  });
  it('creates a persisted empty document with server-derived owner', async () => {
    const r = await alice.post('/api/v1/documents').set(header).expect(201);
    docId = r.body.id;
    ids.push(docId);
    expect(r.body.ownerId).toBe(DEMO_USERS[0].id);
    expect(r.body.content).toEqual(EMPTY_CONTENT);
    await alice.get(path()).expect(200);
    await bob.get(path()).expect(404);
  });
  it('validates title and prevents non-owner rename and delete', async () => {
    await alice
      .patch(path('/title'))
      .set(header)
      .send({ title: '  ' })
      .expect(400);
    await alice
      .patch(path('/title'))
      .set(header)
      .send({ title: 'x'.repeat(151) })
      .expect(400);
    const r = await alice
      .patch(path('/title'))
      .set(header)
      .send({ title: '  Test document  ' })
      .expect(200);
    expect(r.body.title).toBe('Test document');
    await bob
      .patch(path('/title'))
      .set(header)
      .send({ title: 'stolen' })
      .expect(404);
    await bob.delete(path()).set(header).expect(404);
  });
  it('saves rich JSON and rejects stale versions', async () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Persistent', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    };
    const r = await alice
      .patch(path('/content'))
      .set(header)
      .send({ content, expectedVersion: 1 })
      .expect(200);
    expect(r.body.version).toBe(2);
    await alice
      .patch(path('/content'))
      .set(header)
      .send({ content: EMPTY_CONTENT, expectedVersion: 1 })
      .expect(409);
    const reopened = await alice.get(path()).expect(200);
    expect(reopened.body.content).toEqual(content);
    await alice
      .patch(path('/content'))
      .set(header)
      .send({ content: { type: 'script' }, expectedVersion: 2 })
      .expect(400);
  });
  it('atomically allows only one of two concurrent saves', async () => {
    const responses = await Promise.all([
      alice
        .patch(path('/content'))
        .set(header)
        .send({ content: EMPTY_CONTENT, expectedVersion: 2 }),
      alice
        .patch(path('/content'))
        .set(header)
        .send({ content: EMPTY_CONTENT, expectedVersion: 2 }),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
  });
  it('rejects self sharing, invalid permissions, missing users, unauthorized sharing', async () => {
    await alice
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[0].id, permission: 'VIEW' })
      .expect(400);
    await alice
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[1].id, permission: 'OWNER' })
      .expect(400);
    await alice
      .post(path('/shares'))
      .set(header)
      .send({
        userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        permission: 'VIEW',
      })
      .expect(404);
    await bob
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[2].id, permission: 'EDIT' })
      .expect(404);
  });
  it('grants VIEW, rejects duplicates, displays shared list and prevents writes', async () => {
    const r = await alice
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[1].id, permission: 'VIEW' })
      .expect(201);
    shareId = r.body.id;
    await alice
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[1].id, permission: 'EDIT' })
      .expect(409);
    const list = await bob.get('/api/v1/documents?scope=shared').expect(200);
    expect(list.body.some((d: { id: string }) => d.id === docId)).toBe(true);
    await bob.get(path()).expect(200);
    await charlie.get(path()).expect(404);
    await bob
      .patch(path('/content'))
      .set(header)
      .send({ content: EMPTY_CONTENT, expectedVersion: 3 })
      .expect(403);
    await bob
      .patch(path('/title'))
      .set(header)
      .send({ title: 'no' })
      .expect(403);
    await bob.delete(path()).set(header).expect(403);
    await bob.get(path('/shares')).expect(403);
    await bob
      .delete(path(`/shares/${shareId}`))
      .set(header)
      .expect(403);
  });
  it('allows EDIT saves, then downgrades and revokes immediately', async () => {
    await alice
      .patch(path(`/shares/${shareId}`))
      .set(header)
      .send({ permission: 'EDIT' })
      .expect(200);
    await bob
      .patch(path('/content'))
      .set(header)
      .send({ content: EMPTY_CONTENT, expectedVersion: 3 })
      .expect(200);
    await alice
      .patch(path(`/shares/${shareId}`))
      .set(header)
      .send({ permission: 'VIEW' })
      .expect(200);
    await bob
      .patch(path('/content'))
      .set(header)
      .send({ content: EMPTY_CONTENT, expectedVersion: 4 })
      .expect(403);
    await alice
      .delete(path(`/shares/${shareId}`))
      .set(header)
      .expect(200);
    await bob.get(path()).expect(404);
    await bob
      .patch(path('/content'))
      .set(header)
      .send({ content: EMPTY_CONTENT, expectedVersion: 4 })
      .expect(404);
    const list = await bob.get('/api/v1/documents?scope=shared').expect(200);
    expect(list.body.some((d: { id: string }) => d.id === docId)).toBe(false);
  });
  it('imports TXT and Markdown, preserves content and ownership on reopen', async () => {
    for (const [name, text] of [
      ['special <notes>.txt', 'First\n\nSecond'],
      ['notes.md', '# Hello\n\n**bold**\n\n- item'],
    ]) {
      const r = await alice
        .post('/api/v1/documents/import')
        .set(header)
        .attach('file', Buffer.from(text), name)
        .expect(201);
      ids.push(r.body.id);
      expect(r.body.ownerId).toBe(DEMO_USERS[0].id);
      const fetched = await alice
        .get(`/api/v1/documents/${r.body.id}`)
        .expect(200);
      expect(fetched.body.content).toEqual(r.body.content);
    }
  });
  it('rejects empty, binary, unsupported, oversized and multiple uploads', async () => {
    for (const [name, buffer, code] of [
      ['empty.txt', Buffer.from(''), 400],
      ['file.pdf', Buffer.from('hello'), 415],
      ['file.docx', Buffer.from('hello'), 415],
      ['binary.txt', Buffer.from([0xff, 0x00]), 400],
      ['large.txt', Buffer.alloc(2 * 1024 * 1024 + 1, 65), 413],
    ] as const)
      await alice
        .post('/api/v1/documents/import')
        .set(header)
        .attach('file', buffer, name)
        .expect(code);
    await alice
      .post('/api/v1/documents/import')
      .set(header)
      .attach('file', Buffer.from('one'), 'one.txt')
      .attach('file', Buffer.from('two'), 'two.txt')
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/documents/import')
      .set(header)
      .attach('file', Buffer.from('hello'), 'file.txt')
      .expect(401);
  });
  it('deletes only the owned document and cascades sharing', async () => {
    await alice
      .post(path('/shares'))
      .set(header)
      .send({ userId: DEMO_USERS[1].id, permission: 'VIEW' })
      .expect(201);
    await alice.delete(path()).set(header).expect(200);
    await alice.get(path()).expect(404);
    await bob.get(path()).expect(404);
  });
  it('invalidates sessions on logout', async () => {
    const agent = request.agent(app.getHttpServer());
    const login = await agent
      .post('/api/v1/auth/demo-login')
      .set(header)
      .send({ userId: DEMO_USERS[2].id })
      .expect(201);
    const cookie = String(login.headers['set-cookie'][0]).split(';')[0];
    await agent.post('/api/v1/auth/logout').set(header).expect(201);
    await agent.get('/api/v1/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });
});
