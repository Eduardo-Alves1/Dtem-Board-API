import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Returns the authenticated user claims.' })
  getMe(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Roles('ADMIN')
  @Get('roles')
  @ApiOkResponse({ description: 'Lists available roles.' })
  listRoles() {
    return this.usersService.listRoles();
  }

  @Roles('ADMIN')
  @Get()
  @ApiOkResponse({ description: 'Lists active users.' })
  listUsers() {
    return this.usersService.listUsers();
  }

  @Roles('ADMIN')
  @Post()
  @ApiCreatedResponse({ description: 'Creates a user.' })
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOkResponse({ description: 'Returns a user.' })
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ description: 'Updates a user.' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Roles('ADMIN')
  @Patch(':id/roles')
  @ApiOkResponse({ description: 'Replaces user roles.' })
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.usersService.assignRoles(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOkResponse({ description: 'Archives a user and revokes active refresh tokens.' })
  archiveUser(@Param('id') id: string) {
    return this.usersService.archiveUser(id);
  }
}
