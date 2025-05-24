import { IsEmail, IsNotEmpty } from 'class-validator';

export class SessionIdDto {
  @IsEmail({}, { message: 'sessionId deve ser um e-mail válido' })
  @IsNotEmpty({ message: 'sessionId não pode estar vazio' })
  sessionId: string;
}
