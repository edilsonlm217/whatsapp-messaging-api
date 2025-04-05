import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { ConnectionStatusEnum, DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';
import { SessionStateService } from '../session-state/session-state.service';
import { SessionEvent } from 'src/common/interfaces/session-event.interface';

interface SessionMonitorEvent {
  type: DisconnectionReasonEnum;
  sessionId: string;
}

@Injectable()
export class SessionMonitorService implements OnModuleInit, OnModuleDestroy {
  private sessionStateSubscription: Subscription;
  private sessionMonitorEvents$ = new Subject<SessionMonitorEvent>();

  constructor(
    private readonly sessionStateService: SessionStateService,
  ) { }

  onModuleInit() {
    this.subscribeToSessionStateChanges();
  }

  onModuleDestroy(): void {
    this.sessionStateSubscription?.unsubscribe();
  }

  getSessionMonitorEvents$() {
    return this.sessionMonitorEvents$.asObservable();
  }

  private subscribeToSessionStateChanges(): void {
    const stateEventStream = this.sessionStateService.getSessionStateChanges$();

    this.sessionStateSubscription = stateEventStream.subscribe(({ sessionId, action }) => {
      if (action === 'created') {
        this.monitorSession(sessionId);
      }
    });
  }

  private monitorSession(sessionId: string): void {
    const session = this.sessionStateService.find(sessionId);
    if (!session) return;

    const subscription = session.sessionEvents$.subscribe((event: SessionEvent) => {
      const connection = event?.data?.session?.connection;
      if (!connection) { return }

      const { status, reason } = connection;
      if (status !== ConnectionStatusEnum.DISCONNECTED) { return }
      if (!reason) { return }
      this.handleDisconnectionvent(sessionId, reason, subscription);
    });
  }

  private handleDisconnectionvent(
    sessionId: string,
    reason: DisconnectionReasonEnum,
    subscription: Subscription
  ): void {
    if (reason === DisconnectionReasonEnum.LOGOUT) {
      this.sessionStateService.delete(sessionId);
      this.emitMonitorEvent(DisconnectionReasonEnum.LOGOUT, sessionId);
      subscription.unsubscribe();
    } else if (reason === DisconnectionReasonEnum.UNEXPECTED) {
      this.emitMonitorEvent(DisconnectionReasonEnum.UNEXPECTED, sessionId);
    }
  }

  private emitMonitorEvent(reason: DisconnectionReasonEnum, sessionId: string): void {
    this.sessionMonitorEvents$.next({ type: reason, sessionId });
  }
}
