export class QRCodeRegisteredEvent {
  constructor(
    public readonly sessionId: string,
    public readonly qrCode: string
  ) {
  }
}
