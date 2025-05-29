import { Injectable } from "@nestjs/common";
import { EventIndexingService } from "../event-indexing.service";
import { OnEvent } from "@nestjs/event-emitter";
import { StructuredEvent } from "src/common/structured-event.interface";
import { MessageStatusPayload } from "src/common/message-status-payload.interface";

@Injectable()
export class MessageStatusEventListener {
  constructor(private readonly indexingService: EventIndexingService) { }

  @OnEvent('MessageSent', { async: true })
  async onMessageSent(event: StructuredEvent<MessageStatusPayload>) {
    await this.indexingService.indexEvent('events-message-status-history', event);
  }

  @OnEvent('MessageUpdatePersisted', { async: true })
  async onMessageUpdate(event: StructuredEvent<MessageStatusPayload>) {
    await this.indexingService.indexEvent('events-message-status-history', event);
  }
}
