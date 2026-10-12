import { Controller, Get, Module, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DEMO_USERS } from '../auth/demo-users.js';
@Controller('users')
@UseGuards(AuthGuard)
class UsersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() list(@Req() req: AuthenticatedRequest) {
    return this.prisma.user.findMany({
      where: {
        id: { in: DEMO_USERS.map((user) => user.id), not: req.user.id },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }
}
@Module({ controllers: [UsersController] })
export class UsersModule {}
