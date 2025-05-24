import { IsString, IsNotEmpty } from 'class-validator';

export class SessionIdDto {
  @IsString({ message: 'sessionId deve ser uma string' })
  @IsNotEmpty({ message: 'sessionId não pode estar vazio' })
  sessionId: string;
}
