export class RegisterSessionQRCodeCommand {
  constructor(
    public readonly sessionId: string,
    public readonly qrCode: string
  ) { }
}
