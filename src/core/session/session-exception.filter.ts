import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class SessionExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Mapeamento de mensagens específicas para status
    const message = exception.message;
    let status = HttpStatus.INTERNAL_SERVER_ERROR; // Default para erro interno
    let details = ''; // Detalhes adicionais sobre o erro

    // Conflito de recursos (409 - CONFLICT)
    if (message === 'Session already exists') {
      status = HttpStatus.CONFLICT;
    }
    // Recurso inexistente (400 - BAD REQUEST)
    else if (message === 'Session does not exist') {
      status = HttpStatus.BAD_REQUEST;
    }
    // Erros de recurso inexistente ou conflito de dependência (400 ou 409)
    else if (
      message === 'Active socket without session state' ||
      message === 'Session state exists without active socket' ||
      message === 'Session exists but socket is missing' ||
      message === 'Socket exists but session state is missing' ||
      message === 'Session state stream not found'
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR; // Recurso inconsistente
      details = 'Possible inconsistent state.';
    }

    // Envia a resposta com o código de status apropriado e detalhes
    response.status(status).json({
      statusCode: status,
      error: message,
      details, // Detalhes adicionais sobre a inconsistência
    });
  }
}
