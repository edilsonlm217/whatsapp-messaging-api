import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSessionCredsCommand } from "./update-session-creds.command";

@CommandHandler(UpdateSessionCredsCommand)
@Injectable()
export class UpdateSessionCredsHandler implements ICommandHandler<UpdateSessionCredsCommand> {
  constructor() { }

  async execute(command: UpdateSessionCredsCommand): Promise<void> { }
}
