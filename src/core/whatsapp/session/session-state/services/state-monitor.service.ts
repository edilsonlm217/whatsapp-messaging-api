import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { ConnectionStatusEnum, DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';
import { SessionStateService } from '../session-state.service';
import { SessionEvent } from 'src/common/interfaces/session-event.interface';

@Injectable()
export class StateMonitorService implements OnModuleInit, OnModuleDestroy {
  private sessionStateSubscription: Subscription;

  constructor(private readonly sessionStateService: SessionStateService) { }

  onModuleInit() {
    // Assina mudanças no estado das sessões
    const stateEventStream = this.sessionStateService.getSessionStateChanges$();
    this.sessionStateSubscription = stateEventStream.subscribe(({ sessionId, action }) => {
      if (action === 'created') { this.monitorSession(sessionId) }
    });
  }

  onModuleDestroy(): void {
    this.sessionStateSubscription?.unsubscribe();
  }

  private monitorSession(sessionId: string): void {
    const session = this.sessionStateService.find(sessionId);
    if (session) {
      const subscription = session.sessionEvents$.subscribe((event) => {
        if (this.isLogoutEvent(event)) {
          this.cleanupSession(sessionId);
          subscription.unsubscribe();
        }
      });
    }
  }

  private isLogoutEvent(event: SessionEvent | null): boolean {
    const connection = event?.data?.session?.connection;
    if (!connection) return false;

    const { status, reason } = connection;
    return status === ConnectionStatusEnum.DISCONNECTED && reason === DisconnectionReasonEnum.LOGOUT;
  }

  private cleanupSession(sessionId: string) {
    this.sessionStateService.delete(sessionId);
  }
}
