import { Injectable } from '@nestjs/common';
import { WhatsAppSessionFactory } from './whatsapp-session.factory';
import { WASocket } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private sockets = new Map<string, WASocket>();
  private qrCodeSubjects = new Map<string, Subject<string>>();

  constructor(private readonly sessionFactory: WhatsAppSessionFactory) { }

  // Método para iniciar ou reiniciar a sessão com controle de estado
  async startSession(sessionId: string) {
    // Se a sessão já existe e está ativa, não inicializamos de novo
    if (this.sockets.has(sessionId)) {
      throw new Error(`Sessão ${sessionId} já está ativa.`);
    }

    // Se a sessão não existe ou precisa ser reiniciada, inicializa a sessão
    console.log(`Inicializando a sessão ${sessionId}...`);

    // Cria o Subject para o QR Code da sessão
    const qrCodeSubject = new Subject<string>();
    this.qrCodeSubjects.set(sessionId, qrCodeSubject);

    // Inicializa a sessão usando a fábrica e passando o Subject de QR code
    const socket = await this.sessionFactory.initialize(sessionId, qrCodeSubject);
    this.sockets.set(sessionId, socket);

    // Retorna o Observable com o fluxo de QR codes
    return qrCodeSubject.asObservable();
  }
}
