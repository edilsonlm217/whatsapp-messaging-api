import { Controller, Param, Sse } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) { }

  @Sse('events/:sessionId')
  async startSessionAndListenEvents(
    @Param('sessionId') sessionId: string
  ) {
    try {
      const sessionEvents$ = await this.whatsappService.startSession(sessionId);

      if (!sessionEvents$) {
        throw new Error(`Sessão ${sessionId} não encontrada.`);
      }

      return sessionEvents$; // Retorna diretamente o Observable
    } catch (error) {
      throw new Error(`Erro ao iniciar a sessão ${sessionId}: ${error.message}`);
    }
  }
}
