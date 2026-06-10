import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ConfigureProjectWorkItemTypesDto {
  @ApiProperty({ example: ['uuid'] })
  @IsArray()
  @IsString({ each: true })
  workItemTypeIds!: string[];
}
