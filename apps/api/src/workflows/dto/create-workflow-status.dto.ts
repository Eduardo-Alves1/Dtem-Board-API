import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateWorkflowStatusDto {
  @ApiProperty({ example: 'Ready for QA' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'READY_FOR_QA' })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{1,39}$/)
  key!: string;

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
