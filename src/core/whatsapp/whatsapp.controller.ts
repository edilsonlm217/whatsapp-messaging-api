import { Controller, Param, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) { }

  @Sse('events/:sessionId')
  async startSessionAndListenEvents(
    @Param('sessionId') sessionId: string
  ): Promise<Observable<any>> {
    try {
      const sessionEvents$ = await this.whatsappService.startSession(sessionId);

      if (!sessionEvents$) {
        throw new Error(`Sessão ${sessionId} não encontrada.`);
      }

      return new Observable(observer => {
        sessionEvents$.subscribe({
          next: event => {
            observer.next({ type: 'message', data: event });

            // Se a sessão foi iniciada com sucesso, finaliza o SSE após um tempo
            if (event.type === 'sessão iniciada com sucesso') {
              setTimeout(() => {
                observer.complete();
                console.log(`Conexão SSE para a sessão ${sessionId} encerrada.`);
              }, 1000);
            }
          },
          error: err => {
            observer.error(err);
          },
          complete: () => {
            observer.complete();
          },
        });
      });
    } catch (error) {
      throw new Error(`Erro ao iniciar a sessão ${sessionId}: ${error.message}`);
    }
  }
}
