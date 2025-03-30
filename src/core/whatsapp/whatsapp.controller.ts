import { Controller, Delete, Param, Sse } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) { }

  @Sse('/sessions/:sessionId/events')
  async listenToSessionEvents(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.whatsappService.listenToSessionEvents(sessionId);

      if (!session) {
        throw new Error(`Sessão ${sessionId} não encontrada.`);
      }

      return session.sessionEvents$; // Retorna diretamente o Observable
    } catch (error) {
      throw new Error(`Erro ao iniciar a sessão ${sessionId}: ${error.message}`);
    }
  }

  @Delete('sessions/:sessionId')
  async logout(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsappService.logout(sessionId);
      return { message: `Sessão ${sessionId} foi encerrada com sucesso.` };
    } catch (error) {
      throw new Error(`Erro ao tentar encerrar a sessão ${sessionId}: ${error.message}`);
    }
  }
}
