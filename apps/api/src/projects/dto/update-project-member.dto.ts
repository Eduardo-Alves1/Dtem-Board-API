import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class UpdateProjectMemberDto {
  @ApiProperty({ example: 'OWNER' })
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/)
  role!: string;
}
