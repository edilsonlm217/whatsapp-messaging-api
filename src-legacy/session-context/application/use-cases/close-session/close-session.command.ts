export class CloseSessionCommand {
  constructor(
    public readonly sessionId: string,
    public readonly reason: string
  ) { }
}
