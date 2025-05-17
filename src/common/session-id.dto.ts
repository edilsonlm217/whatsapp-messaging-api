import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SessionIdDto {
  @IsString()
  @IsNotEmpty({ message: 'sessionId não pode estar vazio' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'sessionId deve conter apenas letras, números, hífens ou underscores',
  })
  sessionId: string;
}
