import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const parseError =
      exception && typeof exception === 'object' && 'type' in exception
        ? exception.type
        : null;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : parseError === 'entity.too.large'
          ? 413
          : parseError === 'entity.parse.failed'
            ? 400
            : 500;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'message' in payload
          ? payload.message
          : status === 413
            ? 'Request is too large'
            : status === 400
              ? 'Invalid JSON request'
              : 'Service unavailable. Please try again';
    if (status >= 500)
      this.logger.error('Request failed: internal service error');
    res.status(status).json({ statusCode: status, message });
  }
}
