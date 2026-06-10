import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class UpdateWorkflowStatusDto {
  @ApiPropertyOptional({ example: 'Ready for QA' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'READY_FOR_QA' })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{1,39}$/)
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isInitial?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}
