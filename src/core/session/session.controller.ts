import { Body, Controller, HttpCode, HttpStatus, Param, Post, Sse, UseFilters } from "@nestjs/common";
import { map } from "rxjs/operators";
import { SessionService } from "./session.service";
import { SessionExceptionFilter } from "./session-exception.filter";

@Controller('sessions')
@UseFilters(SessionExceptionFilter)
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() body: { sessionId: string }) {
    await this.sessionService.createSession(body.sessionId);

    return {
      message: 'Session creation process started',
      sessionId: body.sessionId,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
  }

  // Endpoint para fazer logout de uma sessão
  @Post(':sessionId/logout')
  @HttpCode(HttpStatus.ACCEPTED)  // Retornando 202 Accepted para indicar que o logout está em progresso
  async logout(@Param('sessionId') sessionId: string) {
    await this.sessionService.logoutSession(sessionId);

    return {
      message: 'Logout process initiated',
      sessionId,
      status: 'pending',  // Indica que o processo de logout foi iniciado
      timestamp: new Date().toISOString(),
    };
  }

  @Sse(':sessionId/stream')
  async stream(@Param('sessionId') sessionId: string) {
    const sessionStateSubject = await this.sessionService.observeSessionState(sessionId);

    // Retorna o BehaviorSubject diretamente
    return sessionStateSubject.asObservable().pipe(
      // Enviando os dados no formato esperado para SSE
      map(state => ({
        data: {
          ...state
        }
      }))
    );
  }
}
