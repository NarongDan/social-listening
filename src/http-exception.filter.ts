import { ExceptionFilter, Catch, HttpException, ArgumentsHost } from '@nestjs/common';

import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const exceptionResponse = exception.getResponse();

    const responseBody =
      typeof exceptionResponse === 'string'
        ? {
            statusCode: status,
            message: exceptionResponse,
            timestamp: new Date().toISOString(),
            path: request.url,
          }
        : {
            statusCode: status,
            ...(exceptionResponse as object),
            timestamp: new Date().toISOString(),
            path: request.url,
          };

    response.status(status).json(responseBody);
  }
}
