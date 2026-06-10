import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateWorkItemAttachmentDto {
  @ApiProperty({ example: 'evidencia.png' })
  @IsString()
  @MinLength(1)
  fileName!: string;

  @ApiPropertyOptional({ example: 'image/png' })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiProperty({ example: 2048 })
  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @ApiProperty({ example: 'work-items/uuid/evidencia.png' })
  @IsString()
  @MinLength(1)
  storageKey!: string;

  @ApiPropertyOptional({ example: 'http://localhost:9000/dtem-board/evidencia.png' })
  @IsString()
  @IsOptional()
  url?: string;
}
