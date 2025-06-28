import { Injectable } from '@nestjs/common';
import { MessageService } from 'src/core/message/message.service';
import { SessionState } from 'src/core/session/session-state/session-state.model';
import { SessionService } from 'src/core/session/session.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly messageService: MessageService,
  ) { }

  async getSnapshot(range: string, sessionId: string) {
    const messages = await this.messageService.getMessagesByRange(sessionId, range);

    const totalMessages = messages.length;
    const { totalSent, totalDelivered, totalRead, totalError, totalPending } = messages.reduce(
      (acc, m) => {
        if (m.status === 0) acc.totalError++;
        if (m.status === 1) acc.totalPending++;
        if (m.status >= 2) acc.totalSent++;
        if (m.status >= 3) acc.totalDelivered++;
        if (m.status === 4) acc.totalRead++;
        return acc;
      },
      { totalSent: 0, totalDelivered: 0, totalRead: 0, totalError: 0, totalPending: 0 }
    );

    // Calculate existing metrics
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const readRate = totalSent > 0 ? (totalRead / totalDelivered) * 100 : 0;
    const undeliveredMessages = totalSent - totalDelivered;
    const deliveredButUnreadMessages = totalDelivered - totalRead;

    // Calculate new metrics: Error Rate and Pending Rate
    const errorRate = totalSent > 0 ? (totalError / totalSent) * 100 : 0;
    const pendingRate = totalSent > 0 ? (totalPending / totalSent) * 100 : 0;

    const recentMessages = messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, 5);

    // Pega o estado atual da sessão
    let sessionState: null | SessionState = null;
    try {
      sessionState = this.sessionService.getSessionState(sessionId);
    } catch {
      // Caso não exista estado (sessão desconectada ou inexistente), deixa null
      sessionState = null;
    }

    return {
      totalMessages,
      totalSent,
      totalDelivered,
      totalRead,
      totalError,
      totalPending,
      deliveryRate: parseFloat(deliveryRate.toFixed(2)),
      readRate: parseFloat(readRate.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(2)),
      pendingRate: parseFloat(pendingRate.toFixed(2)),
      undeliveredMessages,
      deliveredButUnreadMessages,
      recentMessages,
      sessionState,
    };
  }
}