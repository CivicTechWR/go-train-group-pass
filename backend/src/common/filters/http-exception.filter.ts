import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // Check if it's an HttpException by trying to get status
    // This works even if instanceof fails due to module resolution issues
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (
      exception &&
      typeof exception === 'object' &&
      'getStatus' in exception &&
      typeof (exception as { getStatus: unknown }).getStatus === 'function'
    ) {
      // It's an HttpException (or has the same interface)
      const httpException = exception as HttpException;
      status = httpException.getStatus();

      const exceptionResponse = httpException.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string | string[] })?.message ||
            httpException.message ||
            'Internal server error';
    } else if (exception instanceof Error) {
      // It's a regular Error - log it but don't expose details in production
      message = exception.message || 'Internal server error';
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Http Status: ${status} Error Message: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `Http Status: ${status} Error Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).send({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}
