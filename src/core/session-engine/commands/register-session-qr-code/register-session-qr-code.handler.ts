import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegisterSessionQRCodeCommand } from "./register-session-qr-code.command";

@CommandHandler(RegisterSessionQRCodeCommand)
@Injectable()
export class RegisterSessionQRCodeHandler implements ICommandHandler<RegisterSessionQRCodeCommand> {
  constructor() { }

  async execute(command: RegisterSessionQRCodeCommand): Promise<void> { }
}
