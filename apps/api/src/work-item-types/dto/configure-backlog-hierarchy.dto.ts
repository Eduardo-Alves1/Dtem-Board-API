import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BacklogHierarchyItemDto } from './backlog-hierarchy-item.dto';

export class ConfigureBacklogHierarchyDto {
  @ApiProperty({ type: [BacklogHierarchyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BacklogHierarchyItemDto)
  hierarchy!: BacklogHierarchyItemDto[];
}
