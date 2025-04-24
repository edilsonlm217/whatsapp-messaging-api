import { DisconnectionReasonEnum } from "./connection.status.interface";

export interface LogoutDisconnectionEvent {
  sessionId: string;
  timestamp: string;
  reason: DisconnectionReasonEnum.LOGOUT; // reforça que só pode ser LOGOUT
}