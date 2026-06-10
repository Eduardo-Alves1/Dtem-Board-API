import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkItemCommentDto {
  @ApiProperty({ example: 'Ajustei os criterios de aceite.' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({ example: ['uuid'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mentions?: string[];
}
