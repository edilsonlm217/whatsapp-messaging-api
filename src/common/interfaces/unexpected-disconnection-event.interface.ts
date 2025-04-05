import { DisconnectionReasonEnum } from "./connection.status.interface";

export interface UnexpectedDisconnectionEvent {
  sessionId: string;
  timestamp: string;
  reason: DisconnectionReasonEnum.UNEXPECTED; // reforça que só pode ser UNEXPECTED
}