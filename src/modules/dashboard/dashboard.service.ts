import { Injectable } from '@nestjs/common';
import { MessageService } from 'src/core/message/message.service';
import { proto } from '@whiskeysockets/baileys';
@Injectable()
export class DashboardService {
  constructor(private readonly messageService: MessageService) { }

  async getSnapshot(range: string, sessionId: string) {
    const messages = await this.messageService.getMessagesByRange(sessionId, range);

    const totalMessages = messages.length;

    const { totalSent, totalDelivered, totalRead, totalError, totalPending } = messages.reduce(
      (acc, m) => {
        const s = m.status;

        if (s === proto.WebMessageInfo.Status.ERROR) acc.totalError++;
        else if (s === proto.WebMessageInfo.Status.PENDING) acc.totalPending++;
        else if (s === proto.WebMessageInfo.Status.SERVER_ACK) acc.totalSent++;
        else if (s === proto.WebMessageInfo.Status.DELIVERY_ACK) acc.totalDelivered++;
        else if (s === proto.WebMessageInfo.Status.READ) acc.totalRead++;

        return acc;
      },
      { totalSent: 0, totalDelivered: 0, totalRead: 0, totalError: 0, totalPending: 0 }
    );

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;
    const undeliveredMessages = totalSent - totalDelivered;
    const deliveredButUnreadMessages = totalDelivered - totalRead;
    const errorRate = totalSent > 0 ? (totalError / totalSent) * 100 : 0;
    const pendingRate = totalSent > 0 ? (totalPending / totalSent) * 100 : 0;

    const recentMessages = messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, 5);

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
      // demais dados e agregações aqui
    };
  }
}
