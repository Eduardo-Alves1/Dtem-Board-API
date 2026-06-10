import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BacklogHierarchyItemDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  parentTypeId?: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  childTypeId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  level!: number;
}
