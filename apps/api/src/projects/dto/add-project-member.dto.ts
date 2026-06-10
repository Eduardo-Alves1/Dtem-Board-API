import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'MEMBER' })
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/)
  role!: string;
}
