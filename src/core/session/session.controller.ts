import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateSessionCommand } from "./use-cases/create-session";

@Controller('sessions')
export class SessionController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post()
  async create(@Body() body: { sessionId: string }) {
    await this.commandBus.execute(new CreateSessionCommand(body.sessionId));
    return { message: 'Session created!' };
  }
}
