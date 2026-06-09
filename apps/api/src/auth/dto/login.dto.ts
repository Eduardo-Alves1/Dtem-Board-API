import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@dtem.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'change-me-admin-password' })
  @IsString()
  @MinLength(8)
  password!: string;
}
