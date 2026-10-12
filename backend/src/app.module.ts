import {
  Controller,
  Get,
  Module,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { SharingModule } from './sharing/sharing.module.js';
import { ImportsModule } from './imports/imports.module.js';
import { validateEnvironment } from './common/config.js';
@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ImportsModule,
    DocumentsModule,
    SharingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
