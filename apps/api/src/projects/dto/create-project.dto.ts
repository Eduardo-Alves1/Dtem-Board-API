import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'DTEM Board' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'DTEM' })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{1,19}$/)
  key!: string;

  @ApiPropertyOptional({ example: 'Plataforma de gestao agil de projetos.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['uuid'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  memberIds?: string[];
}
