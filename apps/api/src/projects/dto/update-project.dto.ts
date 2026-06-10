import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'DTEM Board API' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'DTEM' })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{1,19}$/)
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ example: 'Plataforma de gestao agil de projetos.' })
  @IsString()
  @IsOptional()
  description?: string;
}
