import { ConnectionStatus } from "./connection.status.interface";

export interface SessionData {
  session: {
    phone?: string;
    phonePlatform?: string;
    connection: ConnectionStatus;
    qr?: string;  // Usado apenas para o status "qr_code"
  }
}