import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'admin@dtem.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
