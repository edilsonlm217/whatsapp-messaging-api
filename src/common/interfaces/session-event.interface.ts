import { SessionData } from "./session.data.interface";

export interface SessionEvent {
  type: string;
  data: SessionData
}
