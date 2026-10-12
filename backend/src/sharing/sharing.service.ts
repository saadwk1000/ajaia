import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DocumentsService } from '../documents/documents.service.js';
import { Prisma } from '../generated/prisma/client.js';
import type { ShareDto, PermissionDto } from './sharing.dto.js';
@Injectable()
export class SharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: DocumentsService,
  ) {}
  async list(id: string, ownerId: string) {
    await this.documents.access(id, ownerId, true);
    return this.prisma.documentShare.findMany({
      where: { documentId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
  async create(id: string, ownerId: string, dto: ShareDto) {
    await this.documents.access(id, ownerId, true);
    if (dto.userId === ownerId)
      throw new BadRequestException('The owner already has full access');
    if (!(await this.prisma.user.findUnique({ where: { id: dto.userId } })))
      throw new NotFoundException('User not found');
    try {
      return await this.prisma.documentShare.create({
        data: { documentId: id, ...dto },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException('This user already has access');
      throw error;
    }
  }
  async update(
    id: string,
    shareId: string,
    ownerId: string,
    dto?: PermissionDto,
  ) {
    await this.documents.access(id, ownerId, true);
    const where = { id: shareId, documentId: id };
    const result = dto
      ? await this.prisma.documentShare.updateMany({ where, data: dto })
      : await this.prisma.documentShare.deleteMany({ where });
    if (!result.count) throw new NotFoundException('Share not found');
    return { success: true };
  }
}
