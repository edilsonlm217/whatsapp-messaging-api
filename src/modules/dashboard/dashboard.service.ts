import { Injectable } from '@nestjs/common';
import { MessageService } from 'src/core/message/message.service';
import { HistogramHelper } from './histogram.helper'; // ajuste o caminho conforme necessário

@Injectable()
export class DashboardService {
  constructor(private readonly messageService: MessageService) { }

  async getSnapshot(range: string, sessionId: string) {
    const messages = await this.messageService.getMessagesByRange(sessionId, range);

    const totalMessages = messages.length;
    const { totalSent, totalDelivered, totalRead } = messages.reduce(
      (acc, m) => {
        if (m.status >= 2) acc.totalSent++;
        if (m.status >= 3) acc.totalDelivered++;
        if (m.status === 4) acc.totalRead++;
        return acc;
      },
      { totalSent: 0, totalDelivered: 0, totalRead: 0 }
    );


    const recentMessages = messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, 5);

    const histogramData = HistogramHelper.generateGroupedHistogram(messages, range);

    return {
      totalMessages,
      totalSent,
      totalDelivered,
      totalRead,
      recentMessages,
      histogramData,
      // demais dados e agregações aqui
    };
  }
}
