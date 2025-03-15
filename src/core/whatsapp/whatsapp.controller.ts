import { Controller, Sse, Query } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { map } from 'rxjs/operators';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) { }

  @Sse('start-session')
  async startSession(@Query('sessionId') sessionId: string) {
    const observable = await this.whatsappService.startSession(sessionId);
    return observable.pipe(map((qrCode) => ({ data: qrCode })));
  }
}
