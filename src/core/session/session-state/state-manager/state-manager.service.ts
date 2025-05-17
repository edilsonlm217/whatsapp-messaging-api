import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { SessionState } from '../session-state.model';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';

@Injectable()
export class StateManagerService {
  private sessionStateMap = new Map<string, SessionState>();
  private sessionStateSubjectMap = new Map<string, BehaviorSubject<SessionState>>();

  constructor(private readonly eventEmitterService: EventEmitterService) { }

  get(sessionId: string): SessionState | undefined {
    return this.sessionStateMap.get(sessionId);
  }

  ensure(sessionId: string): SessionState {
    let sessionState = this.sessionStateMap.get(sessionId);
    if (!sessionState) {
      sessionState = new SessionState(sessionId);
      this.sessionStateMap.set(sessionId, sessionState);
      this.sessionStateSubjectMap.set(sessionId, new BehaviorSubject(sessionState));
    }
    return sessionState;
  }

  getSubject(sessionId: string) {
    return this.sessionStateSubjectMap.get(sessionId);
  }

  update(sessionId: string, updater: (state: SessionState) => void) {
    const sessionState = this.ensure(sessionId);
    updater(sessionState);
    sessionState.lastUpdated = new Date();
    this.persist(sessionId, sessionState);
  }

  private persist(sessionId: string, sessionState: SessionState): void {
    this.sessionStateMap.set(sessionId, sessionState);
    this.sessionStateSubjectMap.get(sessionId)?.next(sessionState);
    this.eventEmitterService.emitEvent<SessionState>(
      sessionId,
      'SessionState',
      'session-state',
      StateManagerService.name,
      sessionState
    );
  }

  /** Remove o estado e o subject associados à sessão */
  remove(sessionId: string): void {
    this.sessionStateMap.delete(sessionId);

    const subject = this.sessionStateSubjectMap.get(sessionId);
    if (subject) {
      subject.complete(); // Encerra o fluxo de eventos para quem estiver inscrito
      this.sessionStateSubjectMap.delete(sessionId);
    }
  }
}
