import { Body, Controller, HttpCode, HttpStatus, Param, Post, Sse, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { SessionService } from "./session.service";
import { SessionExceptionFilter } from "./session-exception.filter";
import { Observable } from "rxjs";
import { CreateSessionDto } from "src/common/create-session.dto";
import { CreateSessionResponse } from "src/common/create-session-response.interface";
import { SessionIdDto } from "src/common/session-id.dto";

@Controller('sessions')
@UseFilters(SessionExceptionFilter)
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() body: CreateSessionDto): Promise<CreateSessionResponse> {
    await this.sessionService.createSession(body.sessionId);

    return {
      message: 'Session creation process started',
      sessionId: body.sessionId
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
    };
  }

  @Sse(':sessionId/stream')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stream(@Param() params: SessionIdDto) {
    const sessionStateSubject = await this.sessionService.observeSessionState(params.sessionId);

    return new Observable((subscriber) => {
      const subscription = sessionStateSubject.subscribe({
        next: (state) => {
          if (state.status === 'qr-timeout' || state.status === 'logged-out') {
            subscriber.next({ data: { state, type: 'end' } });
            subscriber.complete();
          } else {
            subscriber.next({ data: { state, type: 'update' } });
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete() // <- encerra o SSE
      });

      subscriber.add(() => {
        console.log(`Cliente desconectado da sessão ${params.sessionId}`);
        subscription.unsubscribe();
      });
    });
  }
}
