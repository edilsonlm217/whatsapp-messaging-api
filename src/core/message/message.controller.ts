import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { MessageService } from "./message.service";

@Controller('sessions')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  // Método para enviar uma mensagem
  @Post(':sessionId/send-message')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() body: { to: string, message: string }
  ) {

    const result = await this.messageService.sendMessage(sessionId, body.to, body.message);

    return {
      message: 'Message send process initiated',
      sessionId,
      to: body.to,
      status: 'pending',
      timestamp: new Date().toISOString(),
      result: result ? 'Message successfully queued' : 'Failed to queue message'
    };
  }
}
