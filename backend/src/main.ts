import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './common/bootstrap.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  configureApp(app);
  await app.listen(
    app.get(ConfigService).getOrThrow<number>('PORT'),
    '0.0.0.0',
  );
}
bootstrap().catch(() => {
  console.error(
    'API startup failed. Check database connectivity and environment configuration.',
  );
  process.exitCode = 1;
});
