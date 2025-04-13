import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { OpenSessionCommand } from "./open-session.command";

@CommandHandler(OpenSessionCommand)
@Injectable()
export class OpenSessionHandler implements ICommandHandler<OpenSessionCommand> {
  constructor() { }

  async execute(command: OpenSessionCommand): Promise<void> { }
}
