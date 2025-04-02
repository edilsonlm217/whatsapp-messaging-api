import { Controller, Delete, Param, Post, Sse, Logger } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) { }

  @Post('sessions/:sessionId')
  async createSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsappService.createSession(sessionId);
      return { message: `Sessão ${sessionId} criada com sucesso.` };
    } catch (error) {
      this.logger.error(`Erro ao criar a sessão ${sessionId}:`, error);
      return { error: `Não foi possível criar a sessão ${sessionId}.` };
    }
  }

  @Sse('/sessions/:sessionId/events')
  async listenToSessionEvents(@Param('sessionId') sessionId: string) {
    try {
      const eventStream = await this.whatsappService.getSessionEventStream(sessionId);
      if (!eventStream) {
        throw new Error(`Sessão ${sessionId} não encontrada.`);
      }
      return eventStream;
    } catch (error) {
      this.logger.error(`Erro ao escutar eventos da sessão ${sessionId}:`, error);
      return { error: `Não foi possível escutar os eventos da sessão ${sessionId}.` };
    }
  }

  @Delete('sessions/:sessionId')
  async logout(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsappService.logout(sessionId);
      return { message: `Sessão ${sessionId} foi encerrada com sucesso.` };
    } catch (error) {
      this.logger.error(`Erro ao encerrar a sessão ${sessionId}:`, error);
      return { error: `Não foi possível encerrar a sessão ${sessionId}.` };
    }
  }
}
