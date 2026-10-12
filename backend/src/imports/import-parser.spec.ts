import { parseUpload, markdownContent } from './import-parser.js';
import { validateContent } from '../common/content.js';
const file = (
  text: string | Buffer,
  originalname = 'notes.txt',
  mimetype = 'text/plain',
) =>
  ({
    originalname,
    mimetype,
    buffer: Buffer.isBuffer(text) ? text : Buffer.from(text),
  }) as Express.Multer.File;
describe('Secure text imports', () => {
  it('preserves TXT paragraphs, hard breaks, and literal HTML', () => {
    const result = parseUpload(
      file('first\nsecond\n\n<script>alert(1)</script>'),
    );
    expect(result.title).toBe('notes');
    expect(JSON.stringify(result.content)).toContain('hardBreak');
    expect(JSON.stringify(result.content)).toContain('<script>');
  });
  it('converts Markdown heading, bold, italic, bullets and numbering', () => {
    const doc = markdownContent(
      '# Heading\n\n**bold** and *italic*\n\n- one\n- two\n\n1. first\n2. second',
    );
    expect(validateContent(doc)).toEqual(doc);
    for (const type of [
      'heading',
      'bold',
      'italic',
      'bulletList',
      'orderedList',
    ])
      expect(JSON.stringify(doc)).toContain(type);
  });
  it('treats HTML as text and strips executable link attributes', () => {
    const doc = markdownContent(
      '<script>x</script>\n\n[click](javascript:alert(1))',
    );
    expect(validateContent(doc)).toEqual(doc);
    expect(JSON.stringify(doc)).not.toContain('"href"');
  });
  it('handles paths and special characters safely', () =>
    expect(parseUpload(file('hello', '../../my <notes>.txt')).title).toBe(
      'my <notes>',
    ));
  it.each(['', ' \n ', '\u0000binary', '%PDF-file', 'PK\u0003\u0004file'])(
    'rejects empty or binary contents %#',
    (text) => expect(() => parseUpload(file(text))).toThrow(),
  );
  it.each(['file.pdf', 'file.docx', 'file.exe'])(
    'rejects unsupported extension %s',
    (name) => expect(() => parseUpload(file('text', name))).toThrow(),
  );
  it('rejects invalid UTF-8', () =>
    expect(() => parseUpload(file(Buffer.from([0xff, 0xfe])))).toThrow());
  it('rejects a missing file', () => expect(() => parseUpload()).toThrow());
  it('rejects invalid MIME', () =>
    expect(() =>
      parseUpload(file('text', 'a.txt', 'application/pdf')),
    ).toThrow());
});
