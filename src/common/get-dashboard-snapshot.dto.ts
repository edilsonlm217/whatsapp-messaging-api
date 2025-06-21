import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class GetDashboardSnapshotDto {
  @IsNotEmpty({ message: 'O parâmetro range é obrigatório.' })
  @IsString({ message: 'O parâmetro range deve ser uma string.' })
  @IsIn(['1h', '24h', '7d', '30d'], { message: 'O parâmetro range deve ser um dos seguintes valores: 1h, 24h, 7d, 30d.' })
  range: string;

  @IsNotEmpty({ message: 'O parâmetro sessionId é obrigatório e não pode ser vazio.' }) // Agora é obrigatório
  @IsString({ message: 'O parâmetro sessionId deve ser uma string.' })
  sessionId: string;
}