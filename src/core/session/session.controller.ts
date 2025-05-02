import { Body, Controller, HttpCode, HttpStatus, MessageEvent, Param, Post, Sse } from "@nestjs/common";
import { SessionService } from "./session.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";  // Adicionando a importação do map

@Controller('sessions')
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
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    const sessionStateSubject = this.sessionService.observeSessionState(sessionId);

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
