import {
  ForbiddenException,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { Request, Response, NextFunction, Express } from 'express';
import { ApiExceptionFilter } from './exception.filter.js';
export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const origins = config.getOrThrow<string[]>('ALLOWED_FRONTEND_ORIGINS');
  const expressApp: Express = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', config.getOrThrow<number>('TRUST_PROXY'));
  app.setGlobalPrefix('api/v1');
  // Named exports work with both native ESM and Vercel's function compiler.
  // These are the policies enabled by Helmet's default middleware.
  app.use(
    helmet.contentSecurityPolicy(),
    helmet.crossOriginOpenerPolicy(),
    helmet.crossOriginResourcePolicy(),
    helmet.originAgentCluster(),
    helmet.referrerPolicy(),
    helmet.strictTransportSecurity(),
    helmet.xContentTypeOptions(),
    helmet.xDnsPrefetchControl(),
    helmet.xDownloadOptions(),
    helmet.xFrameOptions(),
    helmet.xPermittedCrossDomainPolicies(),
    helmet.xPoweredBy(),
    helmet.xXssProtection(),
  );
  app.use(json({ limit: '2mb' }));
  app.use(cookieParser());
  app.enableCors({
    origin: origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Ajaia-Request'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  // Custom header prevents cross-site form submissions; an exact Origin check covers browser fetches.
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      (req.get('X-Ajaia-Request') !== '1' ||
        (req.get('Origin') && !origins.includes(req.get('Origin')!)))
    ) {
      res.status(403).json({
        statusCode: 403,
        message: new ForbiddenException('Request origin rejected').message,
      });
      return;
    }
    next();
  });
  app.use(
    '/api/v1/auth/demo-login',
    rateLimit({
      windowMs: 60000,
      limit: 30,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Too many requests. Please try again shortly.',
      },
    }),
  );
  app.use(
    '/api/v1/documents',
    rateLimit({
      windowMs: 60000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Too many requests. Please try again shortly.',
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
}
