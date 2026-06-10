import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListWorkItemsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: 'HIGH' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 'backend' })
  @IsString()
  @IsOptional()
  tag?: string;
}
