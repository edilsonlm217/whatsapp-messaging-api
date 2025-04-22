import { Injectable } from '@nestjs/common';
import { AuthStateService } from './auth-state/auth-state.service';
import { BaileysService } from './baileys/baileys.service';
import { SocketManagerService } from './socket-manager/socket-manager.service';
import { BaileysEventsStore } from './baileys/store/baileys-events.store';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly authStateService: AuthStateService,
    private readonly baileysService: BaileysService,
    private readonly socketManagerService: SocketManagerService,
    private readonly baileysEventsStore: BaileysEventsStore,
  ) { }

  async create(sessionId: string) {
    const socketExists = this.socketManagerService.hasSocket(sessionId);
    if (socketExists) throw new Error('Socket already exists');

    const state = await this.authStateService.getAuthState(sessionId);
    const socket = this.baileysService.createSocket(sessionId, state);
    this.socketManagerService.addSocket(sessionId, socket);
  }

  getCategoryStream() {
    return this.baileysEventsStore.getCategoryStream();
  }

  getSessionEventsStream(sessionId: string) {
    return this.baileysEventsStore.getSessionStream(sessionId);
  }
}
