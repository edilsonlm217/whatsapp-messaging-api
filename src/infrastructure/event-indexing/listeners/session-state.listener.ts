import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionState } from 'src/core/session/session-state/session-state.model';
import { StructuredEvent } from 'src/common/structured-event.interface';

@Injectable()
export class SessionStateListener {
  constructor() { }

  @OnEvent('SessionState', { async: true })
  async onSessionStateUpdate(event: StructuredEvent<SessionState>) {
    console.log('SessionState update event', event.payload);
  }
}
