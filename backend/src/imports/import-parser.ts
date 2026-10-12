import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import { type RichNode, validateContent } from '../common/content.js';
const parser = new MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
});
function inline(tokens: Token[]): RichNode[] {
  const marks: string[] = [];
  const nodes: RichNode[] = [];
  for (const token of tokens) {
    if (token.type === 'strong_open') marks.push('bold');
    else if (token.type === 'em_open') marks.push('italic');
    else if (token.type === 'strong_close')
      marks.splice(marks.lastIndexOf('bold'), 1);
    else if (token.type === 'em_close')
      marks.splice(marks.lastIndexOf('italic'), 1);
    else if (['softbreak', 'hardbreak'].includes(token.type))
      nodes.push({ type: 'hardBreak' });
    else if (
      ['text', 'code_inline', 'html_inline', 'image'].includes(token.type) &&
      token.content
    )
      nodes.push({
        type: 'text',
        text: token.content,
        ...(marks.length
          ? { marks: [...new Set(marks)].map((type) => ({ type })) }
          : {}),
      });
  }
  return nodes;
}
export function textContent(text: string): RichNode {
  return {
    type: 'doc',
    content: text
      .replace(/\r\n?/g, '\n')
      .split('\n\n')
      .map((para) => ({
        type: 'paragraph',
        content: para
          .split('\n')
          .flatMap((line, index) => [
            ...(index ? [{ type: 'hardBreak' }] : []),
            ...(line ? [{ type: 'text', text: line }] : []),
          ]),
      })),
  };
}
export function markdownContent(text: string): RichNode {
  const root: RichNode = { type: 'doc', content: [] };
  const stack = [root];
  const types: Record<string, string> = {
    paragraph_open: 'paragraph',
    heading_open: 'heading',
    bullet_list_open: 'bulletList',
    ordered_list_open: 'orderedList',
    list_item_open: 'listItem',
  };
  for (const token of parser.parse(text, {})) {
    const current = stack[stack.length - 1];
    if (types[token.type]) {
      const node: RichNode = { type: types[token.type], content: [] };
      if (node.type === 'heading')
        node.attrs = { level: Math.min(Number(token.tag.slice(1)), 3) };
      if (node.type === 'orderedList')
        node.attrs = { start: Number(token.attrGet('start') || 1) };
      current.content!.push(node);
      stack.push(node);
    } else if (
      token.nesting === -1 &&
      [
        'paragraph_close',
        'heading_close',
        'bullet_list_close',
        'ordered_list_close',
        'list_item_close',
      ].includes(token.type)
    )
      stack.pop();
    else if (token.type === 'inline')
      current.content!.push(...inline(token.children || []));
    else if (['fence', 'code_block'].includes(token.type))
      current.content!.push(...textContent(token.content).content!);
    else if (token.type === 'hr')
      current.content!.push({
        type: 'paragraph',
        content: [{ type: 'text', text: '—' }],
      });
  }
  if (!root.content!.length) root.content = [{ type: 'paragraph' }];
  return root;
}
export function parseUpload(file?: Express.Multer.File) {
  if (!file) throw new BadRequestException('Choose one TXT or Markdown file');
  const filename =
    file.originalname.replace(/\\/g, '/').split('/').pop() ||
    'Imported document';
  const match = /\.(txt|md)$/i.exec(filename);
  if (!match)
    throw new UnsupportedMediaTypeException(
      'Only .txt and .md files are supported',
    );
  if (
    ![
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'application/octet-stream',
    ].includes(file.mimetype)
  )
    throw new UnsupportedMediaTypeException('Invalid text file MIME type');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(file.buffer);
  } catch {
    throw new BadRequestException('File must contain valid UTF-8 text');
  }
  if (!text.trim()) throw new BadRequestException('The file is empty');
  if (
    Array.from(text).some((char) => {
      const code = char.charCodeAt(0);
      return code === 127 || (code < 32 && ![9, 10, 13].includes(code));
    }) ||
    ['%PDF-', 'GIF8'].some((signature) => text.startsWith(signature))
  )
    throw new BadRequestException('Binary files cannot be imported');
  const title =
    filename
      .slice(0, -match[0].length)
      .split('')
      .filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
      .join('')
      .trim()
      .slice(0, 150) || 'Imported document';
  const content =
    match[1].toLowerCase() === 'md' ? markdownContent(text) : textContent(text);
  return { title, content: validateContent(content) };
}
