import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateWorkItemTypeDto {
  @ApiProperty({ example: 'Epic' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Agrupador de alto nivel.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#7C3AED' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'EP' })
  @IsString()
  @IsOptional()
  icon?: string;
}
