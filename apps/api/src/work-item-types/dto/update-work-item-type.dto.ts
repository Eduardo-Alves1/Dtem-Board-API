import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateWorkItemTypeDto {
  @ApiPropertyOptional({ example: 'User Story' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Historia de usuario.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#0284C7' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
