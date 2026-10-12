import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EMPTY_CONTENT, validateContent } from '../common/content.js';
import type { Prisma } from '../generated/prisma/client.js';
const ownerSelect = { id: true, name: true, email: true } as const;
const summarySelect = {
  id: true,
  title: true,
  ownerId: true,
  version: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: ownerSelect },
} as const;
@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}
  async access(id: string, userId: string, ownerOnly = false) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: ownerSelect },
        shares: { where: { userId } },
      },
    });
    if (!doc || (doc.ownerId !== userId && !doc.shares.length))
      throw new NotFoundException('Document not found or access revoked');
    if (ownerOnly && doc.ownerId !== userId)
      throw new ForbiddenException('Only the owner can perform this action');
    const { shares, ...document } = doc;
    return {
      ...document,
      permission: doc.ownerId === userId ? 'OWNER' : shares[0].permission,
    };
  }
  create(
    ownerId: string,
    title = 'Untitled Document',
    content: Prisma.InputJsonValue = validateContent(EMPTY_CONTENT),
  ) {
    return this.prisma.document.create({
      data: { ownerId, title, content },
      include: { owner: { select: ownerSelect } },
    });
  }
  async list(userId: string, scope: 'owned' | 'shared') {
    if (scope === 'owned')
      return (
        await this.prisma.document.findMany({
          where: { ownerId: userId },
          select: summarySelect,
          orderBy: { updatedAt: 'desc' },
        })
      ).map((doc) => ({ ...doc, permission: 'OWNER' }));
    return (
      await this.prisma.document.findMany({
        where: { shares: { some: { userId } } },
        select: {
          ...summarySelect,
          shares: { where: { userId }, select: { permission: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })
    ).map(({ shares, ...doc }) => ({
      ...doc,
      permission: shares[0].permission,
    }));
  }
  async rename(id: string, userId: string, title: string) {
    await this.access(id, userId, true);
    return this.prisma.document.update({
      where: { id },
      data: { title },
      select: summarySelect,
    });
  }
  async save(
    id: string,
    userId: string,
    content: unknown,
    expectedVersion: number,
  ) {
    const safe = validateContent(content);
    // Authorization is part of the conditional write, so revocations cannot be bypassed by a stale pre-check.
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.document.updateMany({
        where: {
          id,
          version: expectedVersion,
          OR: [
            { ownerId: userId },
            { shares: { some: { userId, permission: 'EDIT' } } },
          ],
        },
        data: { content: safe, version: { increment: 1 } },
      });
      if (!result.count) {
        const doc = await this.access(id, userId);
        if (doc.permission === 'VIEW')
          throw new ForbiddenException(
            'Read-only access. Your changes were not saved',
          );
        throw new ConflictException(
          'A newer version exists. Your local changes are preserved; reload to review the latest document',
        );
      }
      return tx.document.findUniqueOrThrow({
        where: { id },
        select: { version: true, updatedAt: true },
      });
    });
  }
  async remove(id: string, userId: string) {
    await this.access(id, userId, true);
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }
}
