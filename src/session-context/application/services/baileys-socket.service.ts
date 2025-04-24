import { Injectable } from '@nestjs/common';
import { AuthenticationCreds } from '@whiskeysockets/baileys';
import { BaileysSocketManager } from 'src/session-context/infrastructure/baileys/baileys-socket-manager';
import { BaileysAuthState } from 'src/session-context/infrastructure/baileys/baileys-auth-state/baileys-auth-state';
import { BaileysAdapter } from 'src/session-context/infrastructure/baileys/baileys.adapter';

@Injectable()
export class BaileysSocketService {
  constructor(
    private readonly baileysSocketManager: BaileysSocketManager,
    private readonly baileysAuthState: BaileysAuthState,
    private readonly baileysAdapter: BaileysAdapter,
  ) { }

  async create(sessionId: string) {
    const socketExists = this.baileysSocketManager.hasSocket(sessionId);
    if (socketExists) throw new Error('Socket already exists');

    const state = await this.baileysAuthState.getAuthState(sessionId);
    const socket = this.baileysAdapter.createSocket(sessionId, state);
    this.baileysSocketManager.addSocket(sessionId, socket);
  }

  async restart(sessionId: string) {
    const socketExists = this.baileysSocketManager.hasSocket(sessionId);
    if (!socketExists) throw new Error('Socket does not exist');

    const state = await this.baileysAuthState.getAuthState(sessionId);
    const newSocket = this.baileysAdapter.createSocket(sessionId, state);
    this.baileysSocketManager.replaceSocket(sessionId, newSocket);
  }

  async deleteAuthState(sessionId: string) {
    await this.baileysAuthState.deleteAuthState(sessionId);
  }

  async disposeSocket(sessionId: string): Promise<void> {
    const socketExists = this.baileysSocketManager.hasSocket(sessionId);
    if (!socketExists) throw new Error('Socket does not exist');
    this.baileysSocketManager.removeSocket(sessionId);
  }


  async logout(sessionId: string): Promise<void> {
    const socket = this.baileysSocketManager.getSocket(sessionId);
    if (!socket) throw new Error('Socket does not exist')
    await socket.logout();
    await this.baileysAuthState.deleteAuthState(sessionId);
    this.baileysSocketManager.removeSocket(sessionId);
  }

  async saveCreds(sessionId: string, creds: AuthenticationCreds) {
    await this.baileysAuthState.saveCreds(sessionId, creds);
  }
}
