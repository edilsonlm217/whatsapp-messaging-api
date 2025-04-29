import { Injectable } from '@nestjs/common';
import { WASocket } from '@whiskeysockets/baileys';

@Injectable()
export class SocketManagerService {
  private socketsMap: Map<string, WASocket> = new Map();

  constructor() { }

  // Adiciona um socket ao mapa
  addSocket(sessionId: string, socket: WASocket): void {
    this.socketsMap.set(sessionId, socket);
  }

  // Recupera um socket específico
  getSocket(sessionId: string): WASocket | undefined {
    return this.socketsMap.get(sessionId);
  }

  // Verifica se existe um socket para a sessão
  hasSocket(sessionId: string): boolean {
    return this.socketsMap.has(sessionId);
  }

  // Remove um socket do mapa
  removeSocket(sessionId: string): void {
    this.socketsMap.delete(sessionId);
  }

  // Lista todas as sessões ativas
  listSessionIds(): string[] {
    return Array.from(this.socketsMap.keys());
  }

  // Limpa todos os sockets
  clearSockets(): void {
    this.socketsMap.clear();
  }

  // Substitui um socket existente por um novo
  replaceSocket(sessionId: string, newSocket: WASocket): void {
    this.socketsMap.set(sessionId, newSocket);  // Substitui o socket existente (se houver)
  }
}
