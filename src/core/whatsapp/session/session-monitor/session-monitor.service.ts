import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';
import { SessionStateService } from '../session-state/session-state.service';
import { AuthenticationCreds } from '@whiskeysockets/baileys';
import { UnexpectedDisconnectionEvent } from 'src/common/interfaces/unexpected-disconnection-event.interface';
import { LogoutDisconnectionEvent } from 'src/common/interfaces/logout-disconnection-event.interface';
import { CredsUpdateEvent } from 'src/common/interfaces/creds-update-event.interface';

@Injectable()
export class SessionMonitorService implements OnModuleInit, OnModuleDestroy {
  private sessionStateSubscription: Subscription;
  private sessionSubscriptions = new Map<string, Subscription[]>();

  private unexpectedDisconnection$ = new Subject<UnexpectedDisconnectionEvent>();
  private logoutDisconnection$ = new Subject<LogoutDisconnectionEvent>();
  private credsUpdate$ = new Subject<CredsUpdateEvent>();

  constructor(private readonly sessionStateService: SessionStateService) { }

  getUnexpectedDisconnection$() {
    return this.unexpectedDisconnection$.asObservable();
  }

  getLogoutDisconnection$() {
    return this.logoutDisconnection$.asObservable();
  }

  getCredsUpdate$() {
    return this.credsUpdate$.asObservable();
  }

  onModuleInit() {
    this.subscribeToSessionStateChanges();
  }

  onModuleDestroy(): void {
    this.sessionStateSubscription?.unsubscribe();

    // limpa todos os subscriptions ativos
    this.sessionSubscriptions.forEach((subs) => subs.forEach((sub) => sub.unsubscribe()));
    this.sessionSubscriptions.clear();
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

    const subs: Subscription[] = [];

    const credsSub = session.credsUpdate$.subscribe((event) => {
      this.emitCredsUpdate(event.sessionId, event.creds);
    });

    const logoutSub = session.logoutDisconnection$.subscribe((event) => {
      this.sessionStateService.delete(sessionId);
      this.emitLogoutDisconnection(event.sessionId);
      this.cleanupSessionSubscriptions(sessionId);
    });

    const unexpectedSub = session.unexpectedDisconnection$.subscribe((event) => {
      this.emitUnexpectedDisconnection(event.sessionId);
    });

    subs.push(credsSub, logoutSub, unexpectedSub);
    this.sessionSubscriptions.set(sessionId, subs);
  }

  private cleanupSessionSubscriptions(sessionId: string) {
    const subs = this.sessionSubscriptions.get(sessionId);
    if (subs) {
      subs.forEach((sub) => sub.unsubscribe());
      this.sessionSubscriptions.delete(sessionId);
    }
  }

  private emitUnexpectedDisconnection(sessionId: string) {
    this.unexpectedDisconnection$.next({
      sessionId,
      reason: DisconnectionReasonEnum.UNEXPECTED,
      timestamp: new Date().toISOString(),
    });
  }

  private emitLogoutDisconnection(sessionId: string) {
    this.logoutDisconnection$.next({
      sessionId,
      reason: DisconnectionReasonEnum.LOGOUT,
      timestamp: new Date().toISOString(),
    });
  }

  private emitCredsUpdate(sessionId: string, creds: AuthenticationCreds) {
    this.credsUpdate$.next({
      sessionId,
      creds,
      timestamp: new Date().toISOString(),
    });
  }
}
