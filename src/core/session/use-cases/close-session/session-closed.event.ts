export class SessionClosedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly reason: string
  ) { }
}
