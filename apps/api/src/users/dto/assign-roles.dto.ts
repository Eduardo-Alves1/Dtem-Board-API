import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ example: ['PRODUCT_OWNER', 'SCRUM_MASTER'] })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
}
