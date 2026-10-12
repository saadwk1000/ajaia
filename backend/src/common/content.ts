import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, number | string | null>;
  marks?: { type: string }[];
  content?: RichNode[];
};
export const EMPTY_CONTENT: RichNode = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};
const children: Record<string, string[]> = {
  doc: ['paragraph', 'heading', 'bulletList', 'orderedList'],
  paragraph: ['text', 'hardBreak'],
  heading: ['text', 'hardBreak'],
  bulletList: ['listItem'],
  orderedList: ['listItem'],
  listItem: ['paragraph', 'heading', 'bulletList', 'orderedList'],
  text: [],
  hardBreak: [],
};
export function validateContent(value: unknown): Prisma.InputJsonValue {
  const fail = (): never => {
    throw new BadRequestException('Invalid or unsupported rich-text content');
  };
  if (JSON.stringify(value)?.length > 2 * 1024 * 1024) fail();
  let count = 0;
  const walk = (raw: unknown, depth: number): RichNode => {
    if (
      !raw ||
      typeof raw !== 'object' ||
      Array.isArray(raw) ||
      depth > 40 ||
      ++count > 100000
    )
      return fail();
    const n = raw as Record<string, unknown>;
    if (
      typeof n.type !== 'string' ||
      !Object.hasOwn(children, n.type) ||
      Object.keys(n).some(
        (k) => !['type', 'content', 'attrs', 'marks', 'text'].includes(k),
      )
    )
      return fail();
    if (n.type === 'text') {
      if (
        typeof n.text !== 'string' ||
        !n.text.length ||
        n.content !== undefined ||
        n.attrs !== undefined
      )
        return fail();
    } else if (n.text !== undefined || n.marks !== undefined) return fail();
    if (
      n.marks !== undefined &&
      (!Array.isArray(n.marks) ||
        n.marks.some(
          (m) =>
            !m ||
            typeof m !== 'object' ||
            Object.keys(m).length !== 1 ||
            !['bold', 'italic', 'underline'].includes(m.type),
        ))
    )
      return fail();
    if (n.attrs !== undefined) {
      if (!n.attrs || typeof n.attrs !== 'object' || Array.isArray(n.attrs))
        return fail();
      const attrs = n.attrs as Record<string, unknown>;
      const key =
        n.type === 'heading'
          ? 'level'
          : n.type === 'orderedList'
            ? 'start'
            : '';
      if (
        !key ||
        Object.keys(attrs).some(
          (k) => k !== key && !(n.type === 'orderedList' && k === 'type'),
        ) ||
        (n.type === 'orderedList' &&
          attrs.type !== undefined &&
          attrs.type !== null &&
          !['1', 'a', 'A', 'i', 'I'].includes(String(attrs.type))) ||
        !Number.isInteger(attrs[key]) ||
        Number(attrs[key]) < 1 ||
        (key === 'level' && Number(attrs[key]) > 3) ||
        Number(attrs[key]) > 1000000
      )
        return fail();
    }
    if (n.type === 'heading' && n.attrs === undefined) return fail();
    if (n.content !== undefined) {
      if (!Array.isArray(n.content) || !children[n.type].length) return fail();
      for (const child of n.content) {
        const c = walk(child, depth + 1);
        if (!children[n.type].includes(c.type)) return fail();
      }
    }
    if (
      ['doc', 'bulletList', 'orderedList', 'listItem'].includes(n.type) &&
      (!Array.isArray(n.content) || !n.content.length)
    )
      return fail();
    if (
      n.type === 'listItem' &&
      (n.content as RichNode[])[0].type !== 'paragraph'
    )
      return fail();
    return n as RichNode;
  };
  if (walk(value, 0).type !== 'doc') return fail();
  return value as Prisma.InputJsonValue;
}
