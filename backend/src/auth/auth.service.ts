import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { DEMO_USERS } from './demo-users.js';
export const sessionHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login(userId: string, previous?: string) {
    if (!DEMO_USERS.some((user) => user.id === userId))
      throw new UnauthorizedException('Select an available demo account');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user)
      throw new UnauthorizedException(
        'Demo account unavailable. Run the seed command.',
      );
    const token = randomBytes(32).toString('hex');
    await this.prisma.$transaction(async (tx) => {
      if (previous)
        await tx.session.deleteMany({
          where: { tokenHash: sessionHash(previous) },
        });
      await tx.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      await tx.session.create({
        data: {
          tokenHash: sessionHash(token),
          userId,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
    });
    return { token, user };
  }
  async resolve(token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException('Please log in');
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: sessionHash(token) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!session || session.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('Session expired. Please log in again');
    return session.user;
  }
  async logout(token?: string) {
    if (token)
      await this.prisma.session.deleteMany({
        where: { tokenHash: sessionHash(token) },
      });
  }
}
