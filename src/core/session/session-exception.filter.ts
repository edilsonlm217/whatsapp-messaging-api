import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class SessionExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Se o erro for "Socket already exists"
    if (exception.message.includes('Socket already exists')) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Socket already exists. Please check the socket state.',
        timestamp: new Date().toISOString(),
      });
    }

    // Se o erro for "Session already exists"
    if (exception.message.includes('Session already exists')) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Session already exists. Please check the session state.',
        timestamp: new Date().toISOString(),
      });
    }

    // Se o erro for de outro tipo
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
