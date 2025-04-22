import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class IntegrationService {
  constructor(private readonly whatsAppService: WhatsAppService) { }

  // Esse método será chamado quando o evento 'session.created' for emitido
  @OnEvent('session.created')
  async handleSessionCreated(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService:', payload);
      await this.whatsAppService.create(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }
}
