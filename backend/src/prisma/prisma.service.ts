import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const schema =
      new URL(connectionString).searchParams.get('schema') || 'public';
    super({
      adapter: new PrismaPg(
        {
          connectionString,
          max: config.getOrThrow<number>('DB_POOL_MAX'),
          connectionTimeoutMillis: config.getOrThrow<number>(
            'DB_CONNECT_TIMEOUT_MS',
          ),
        },
        { schema },
      ),
    });
  }
  async onModuleInit() {
    await this.$connect();
    await this.$queryRaw`SELECT 1`;
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
