import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CloseSessionCommand } from "./close-session.command";

@CommandHandler(CloseSessionCommand)
@Injectable()
export class CloseSessionHandler implements ICommandHandler<CloseSessionCommand> {
  constructor() { }

  async execute(command: CloseSessionCommand): Promise<void> { }
}
