import { Message } from "src/core/message/message.repository";

export type HistogramInterval = 'hour' | 'day' | 'week';

export interface HistogramBarGrouped {
  x: number;       // timestamp em ms para eixo X
  g: string;       // ackStatus como string para agrupar as barras (agora será o texto em PT-BR)
  y: number;       // contagem de mensagens
}

// Mapeamento dos status para texto em português
export const StatusDisplayName: { [key: number]: string } = {
  0: 'Erro',
  1: 'Pendente',
  2: 'Enviado',
  3: 'Entregue',
  4: 'Lido',
  5: 'Reproduzido',
};

export class HistogramHelper {
  static getIntervalForRange(range: string): HistogramInterval {
    switch (range) {
      case '1h':
        return 'hour';
      case '24h':
        return 'hour'; // ou 'day', dependendo do detalhe que quiser
      case '7d':
        return 'day';
      case '30d':
        return 'week';
      default:
        return 'day';
    }
  }

  static generateGroupedHistogram(messages: Message[], range: string): HistogramBarGrouped[] {
    const interval = this.getIntervalForRange(range);

    const countsMap = new Map<string, { timestamp: number; ackStatus: string; count: number }>();

    messages.forEach(message => {
      // converter sentAt para Date
      // OBS: se message.sentAt já é um timestamp em MS, remova o * 1000
      // Se for em segundos, mantenha o * 1000.
      // Pelos exemplos anteriores, parecia ser em milissegundos.
      const date = new Date(message.sentAt); // Alterado para new Date(message.sentAt) assumindo MS

      // gerar timestamp truncado conforme intervalo
      let truncatedDate: Date;
      switch (interval) {
        case 'hour':
          truncatedDate = new Date(date);
          truncatedDate.setMinutes(0, 0, 0);
          break;
        case 'day':
          truncatedDate = new Date(date);
          truncatedDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          // pegar domingo da semana (assumindo que Sunday é 0)
          const dayOfWeek = date.getDay(); // 0 (dom) - 6 (sáb)
          truncatedDate = new Date(date);
          truncatedDate.setHours(0, 0, 0, 0);
          truncatedDate.setDate(date.getDate() - dayOfWeek);
          break;
      }

      const timestamp = truncatedDate.getTime();
      // AQUI É A ALTERAÇÃO CHAVE: Mapear o número do status para a string correspondente
      const ackStatusStr = StatusDisplayName[message.status] || 'Desconhecido'; // Adiciona um fallback

      const key = `${timestamp}|${ackStatusStr}`;

      const existing = countsMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        countsMap.set(key, { timestamp, ackStatus: ackStatusStr, count: 1 });
      }
    });

    // converter mapa para array no formato esperado pelo gráfico
    const result: HistogramBarGrouped[] = [];

    countsMap.forEach(({ timestamp, ackStatus, count }) => {
      result.push({
        x: timestamp,
        g: ackStatus,
        y: count,
      });
    });

    // ordenar pelo timestamp e ackStatus para facilitar uso
    result.sort((a, b) => {
      if (a.x === b.x) {
        return a.g.localeCompare(b.g);
      }
      return a.x - b.x;
    });

    return result;
  }
}