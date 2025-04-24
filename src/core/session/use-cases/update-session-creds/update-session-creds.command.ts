export class UpdateSessionCredsCommand {
  constructor(
    public readonly sessionId: string,
    public readonly phone: string,
    public readonly phonePlatform: string,
  ) { }
}
