import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isProduction } from '../../config/env.validation';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const production = isProduction(process.env.NODE_ENV);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.warn(`${request.method} ${request.url} status=${status}`);
      if (production && status >= 500) {
        response.status(status).json({
          statusCode: status,
          message: '서버 오류',
        });
        return;
      }
      response.status(status).json(this.publicPayload(status, exception.getResponse()));
      return;
    }

    this.logger.error(
      `${request.method} ${request.url} 처리 중 오류`,
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 오류',
    });
  }

  private publicPayload(status: number, payload: string | object) {
    if (typeof payload === 'string') {
      return { statusCode: status, message: payload };
    }
    const { stack: _stack, ...safe } = payload as {
      stack?: unknown;
      message?: unknown;
      statusCode?: unknown;
    };
    return {
      statusCode: status,
      ...safe,
    };
  }
}
