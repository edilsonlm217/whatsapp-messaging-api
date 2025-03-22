import { Controller, Param, Sse, Res } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) { }

  @Sse('events/:sessionId')
  startSessionAndListenEvents(
    @Param('sessionId') sessionId: string,
    @Res() res: Response  // Usando Response diretamente para acessar o método end
  ): Observable<any> {
    return new Observable((observer) => {
      this.whatsappService.startSession(sessionId)
        .then(() => {
          const session = this.whatsappService.getSession(sessionId);
          if (!session) {
            throw new Error(`Sessão ${sessionId} não encontrada.`);
          }

          // Envia os eventos para o cliente
          session.sessionEvents$.subscribe((event) => {
            observer.next({
              type: 'message',
              data: event,
            });
          });

          // Após a sessão ser aberta com sucesso, fechamos a conexão SSE no servidor
          session.sessionEvents$.subscribe({
            next: (event) => {
              if (event.type === 'sessão iniciada com sucesso') {
                setTimeout(() => {
                  res.end();  // Fecha a conexão após a sessão ser aberta
                  console.log(`Conexão para a sessão ${sessionId} fechada no servidor.`);
                }, 1000);  // Tempo para garantir que o cliente recebeu a mensagem
              }
            },
            error: (err) => {
              observer.error(err);
              res.end();  // Fechar a conexão em caso de erro
            },
            complete: () => {
              res.end();  // Fechar a conexão quando a sessão terminar
            },
          });
        })
        .catch((err) => {
          observer.error(err);
          res.end();  // Fechar a conexão caso haja erro
        });
    });
  }
}
