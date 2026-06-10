import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWorkItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  typeId!: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ example: 'Criar tela de backlog' })
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title!: string;

  @ApiPropertyOptional({ example: 'Como usuario, quero visualizar o backlog do projeto.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Dado que existem itens, quando acesso o backlog, entao vejo a lista.' })
  @IsString()
  @IsOptional()
  acceptanceCriteria?: string;

  @ApiPropertyOptional({ example: 'HIGH' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimate?: number;

  @ApiPropertyOptional({ example: 'SPRINT-1' })
  @IsString()
  @IsOptional()
  sprintKey?: string;

  @ApiPropertyOptional({ example: ['frontend', 'backlog'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
