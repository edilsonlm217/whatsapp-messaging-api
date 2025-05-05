import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionState } from 'src/core/session/session-state/session-state.model';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { EventIndexingService } from '../event-indexing.service';

@Injectable()
export class SessionStateListener {
  constructor(private readonly indexingService: EventIndexingService) { }

  @OnEvent('SessionState', { async: true })
  async onSessionStateUpdate(event: StructuredEvent<SessionState>) {
    await this.indexingService.indexEvent(event);
  }
}
