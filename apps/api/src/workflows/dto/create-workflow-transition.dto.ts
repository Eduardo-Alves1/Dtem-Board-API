import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkflowTransitionDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  fromStatusId!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  toStatusId!: string;

  @ApiPropertyOptional({ example: 'Start progress' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;
}
