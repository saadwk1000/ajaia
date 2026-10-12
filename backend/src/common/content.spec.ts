import { validateContent, EMPTY_CONTENT } from './content.js';
import { validateEnvironment } from './config.js';
describe('Rich-text security', () => {
  it('accepts the empty document', () =>
    expect(validateContent(EMPTY_CONTENT)).toEqual(EMPTY_CONTENT));
  it('preserves supported heading and inline formatting', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Hello',
              marks: [{ type: 'bold' }, { type: 'underline' }],
            },
          ],
        },
      ],
    };
    expect(validateContent(doc)).toEqual(doc);
  });
  it.each([
    { type: 'doc', content: [{ type: 'script', text: 'alert(1)' }] },
    {
      type: 'doc',
      content: [{ type: 'paragraph', attrs: { onclick: 'alert(1)' } }],
    },
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'javascript:x' } }],
            },
          ],
        },
      ],
    },
    { type: 'doc', content: [{ type: 'heading', attrs: { level: 8 } }] },
    { type: 'doc', content: [{ type: 'text', text: 'not a block' }] },
    { type: 'doc', content: [] },
    {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: -1 },
          content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
        },
      ],
    },
  ])('rejects unsupported structures %#', (value) =>
    expect(() => validateContent(value)).toThrow(),
  );
  it('accepts Tiptap numbered-list default attributes', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 1, type: null },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Numbered item' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(validateContent(doc)).toEqual(doc);
  });
  it('bounds nesting depth', () => {
    let child: object = { type: 'paragraph' };
    for (let i = 0; i < 50; i++)
      child = {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph' }, child] },
        ],
      };
    expect(() => validateContent({ type: 'doc', content: [child] })).toThrow();
  });
});
describe('Environment validation', () => {
  it('accepts a valid development URL', () =>
    expect(
      validateEnvironment({ DATABASE_URL: 'postgresql://localhost/test' }).PORT,
    ).toBe(4000));
  it('rejects missing persistence', () =>
    expect(() => validateEnvironment({})).toThrow());
  it('rejects unsafe production origins', () =>
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'postgresql://localhost/test',
        NODE_ENV: 'production',
        FRONTEND_ORIGIN: 'http://localhost:3000',
      }),
    ).toThrow());
});

describe('Hosted deployment environment', () => {
  const base = {
    DATABASE_URL: 'postgresql://localhost/test',
    VERCEL: '1',
    VERCEL_ENV: 'preview',
  };
  it('fails clearly instead of selecting localhost when the frontend origin is missing', () => {
    expect(() => validateEnvironment(base)).toThrow(
      'FRONTEND_ORIGIN is required',
    );
  });
  it('uses secure cookies and a trusted proxy on Vercel previews', () => {
    const config = validateEnvironment({
      ...base,
      NODE_ENV: 'development',
      FRONTEND_ORIGIN: 'https://web.example.com',
    });
    expect(config.SESSION_COOKIE_SECURE).toBe(true);
    expect(config.TRUST_PROXY).toBe(1);
  });
  it('allows only explicitly configured preview and custom-domain origins', () => {
    const config = validateEnvironment({
      ...base,
      FRONTEND_ORIGIN: 'https://web.example.com',
      ADDITIONAL_FRONTEND_ORIGINS:
        ' https://preview.example.com, https://web.example.com ',
    });
    expect(config.ALLOWED_FRONTEND_ORIGINS).toEqual([
      'https://web.example.com',
      'https://preview.example.com',
    ]);
  });
  it.each([
    'http://web.example.com',
    'https://localhost',
    'https://web.example.com/',
    'https://web.example.com/editor',
  ])('rejects an invalid hosted origin %s', (origin) => {
    expect(() =>
      validateEnvironment({ ...base, FRONTEND_ORIGIN: origin }),
    ).toThrow();
  });
  it('rejects wildcard origins rather than authorizing arbitrary deployments', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        FRONTEND_ORIGIN: 'https://web.example.com',
        ADDITIONAL_FRONTEND_ORIGINS: '*',
      }),
    ).toThrow();
  });
  it('bounds pool, timeout, and proxy settings', () => {
    for (const invalid of [
      { DB_POOL_MAX: 0 },
      { DB_CONNECT_TIMEOUT_MS: -1 },
      { TRUST_PROXY: 2 },
    ])
      expect(() =>
        validateEnvironment({
          ...base,
          FRONTEND_ORIGIN: 'https://web.example.com',
          ...invalid,
        }),
      ).toThrow();
  });
});
