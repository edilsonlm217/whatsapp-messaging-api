export interface StructuredEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  timestamp: string;
  sessionId: string;
  eventType: string;
  source: string;
  origin: string;
  payload: TPayload;
}