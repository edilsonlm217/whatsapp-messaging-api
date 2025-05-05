import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthenticationCreds } from '@whiskeysockets/baileys';
import { SocketManagerService } from './socket-manager/socket-manager.service';
import { AuthStateService } from './auth-state/auth-state.service';
import { BaileysService } from './baileys/baileys.service';

@Injectable()
export class BaileysSocketService implements OnModuleInit {
  constructor(
    private readonly socketManagerService: SocketManagerService,
    private readonly authStateService: AuthStateService,
    private readonly baileysService: BaileysService,
  ) { }

  async onModuleInit() {
    const sessionIds = await this.authStateService.listSessionIds();

    for (const sessionId of sessionIds) {
      try {
        await this.createSocket(sessionId);
      } catch (error) {
        console.error(`Falha ao restaurar sessão ${sessionId}: ${error.message}`);
      }
    }
  }

  async createSocket(sessionId: string) {
    const socketExists = this.socketManagerService.hasSocket(sessionId);
    if (socketExists) throw new Error('Socket already exists');

    const state = await this.authStateService.getAuthState(sessionId);
    const socket = this.baileysService.createSocket(sessionId, state);
    this.socketManagerService.addSocket(sessionId, socket);
  }

  async hasSocket(sessionId: string) {
    return this.socketManagerService.hasSocket(sessionId);
  }

  async restart(sessionId: string) {
    const socketExists = this.socketManagerService.hasSocket(sessionId);
    if (!socketExists) throw new Error('Socket does not exist');

    const state = await this.authStateService.getAuthState(sessionId);
    const newSocket = this.baileysService.createSocket(sessionId, state);
    this.socketManagerService.replaceSocket(sessionId, newSocket);
  }

  async deleteAuthState(sessionId: string) {
    await this.authStateService.deleteAuthState(sessionId);
  }

  disposeSocket(sessionId: string) {
    const socketExists = this.socketManagerService.hasSocket(sessionId);
    if (!socketExists) throw new Error('Socket does not exist');
    this.socketManagerService.removeSocket(sessionId);
  }

  async logout(sessionId: string): Promise<void> {
    const socket = this.socketManagerService.getSocket(sessionId);
    if (!socket) throw new Error('Socket does not exist')
    await socket.logout();
  }

  async saveCreds(sessionId: string, creds: AuthenticationCreds) {
    await this.authStateService.saveCreds(sessionId, creds);
  }
}
