import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiBearerAuth()
@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists projects visible to the authenticated user.' })
  listProjects(@CurrentUser() user: AuthUser) {
    return this.projectsService.listProjects(user);
  }

  @Roles('ADMIN')
  @Post()
  @ApiCreatedResponse({ description: 'Creates a project.' })
  createProject(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a project.' })
  getProject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projectsService.getProject(user, id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ description: 'Updates a project.' })
  updateProject(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.updateProject(user, id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOkResponse({ description: 'Archives a project.' })
  archiveProject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projectsService.archiveProject(user, id);
  }

  @Roles('ADMIN')
  @Post(':id/members')
  @ApiCreatedResponse({ description: 'Adds or updates a project member.' })
  addMember(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectsService.addMember(user, id, dto);
  }

  @Roles('ADMIN')
  @Patch(':id/members/:userId')
  @ApiOkResponse({ description: 'Updates a project member role.' })
  updateMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember(user, id, userId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id/members/:userId')
  @ApiOkResponse({ description: 'Removes a project member.' })
  removeMember(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(user, id, userId);
  }
}
