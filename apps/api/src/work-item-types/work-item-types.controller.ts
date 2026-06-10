import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { ConfigureBacklogHierarchyDto } from './dto/configure-backlog-hierarchy.dto';
import { ConfigureProjectWorkItemTypesDto } from './dto/configure-project-work-item-types.dto';
import { CreateWorkItemTypeDto } from './dto/create-work-item-type.dto';
import { UpdateWorkItemTypeDto } from './dto/update-work-item-type.dto';
import { WorkItemTypesService } from './work-item-types.service';

@ApiBearerAuth()
@ApiTags('work-item-types')
@Controller()
export class WorkItemTypesController {
  constructor(private readonly workItemTypesService: WorkItemTypesService) {}

  @Get('work-item-types')
  @ApiOkResponse({ description: 'Lists configured work item types.' })
  listWorkItemTypes() {
    return this.workItemTypesService.listWorkItemTypes();
  }

  @Roles('ADMIN')
  @Post('work-item-types')
  @ApiCreatedResponse({ description: 'Creates a work item type.' })
  createWorkItemType(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkItemTypeDto) {
    return this.workItemTypesService.createWorkItemType(user, dto);
  }

  @Roles('ADMIN')
  @Patch('work-item-types/:id')
  @ApiOkResponse({ description: 'Updates a work item type.' })
  updateWorkItemType(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateWorkItemTypeDto,
  ) {
    return this.workItemTypesService.updateWorkItemType(user, id, dto);
  }

  @Roles('ADMIN')
  @Delete('work-item-types/:id')
  @ApiOkResponse({ description: 'Inactivates a work item type.' })
  archiveWorkItemType(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.workItemTypesService.archiveWorkItemType(user, id);
  }

  @Get('projects/:projectId/work-item-types')
  @ApiOkResponse({ description: 'Lists work item types enabled for a project.' })
  listProjectWorkItemTypes(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    return this.workItemTypesService.listProjectWorkItemTypes(user, projectId);
  }

  @Roles('ADMIN')
  @Put('projects/:projectId/work-item-types')
  @ApiOkResponse({ description: 'Replaces work item types enabled for a project.' })
  configureProjectWorkItemTypes(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: ConfigureProjectWorkItemTypesDto,
  ) {
    return this.workItemTypesService.configureProjectWorkItemTypes(user, projectId, dto);
  }

  @Get('projects/:projectId/backlog-hierarchy')
  @ApiOkResponse({ description: 'Returns project backlog hierarchy.' })
  getProjectBacklogHierarchy(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    return this.workItemTypesService.getProjectBacklogHierarchy(user, projectId);
  }

  @Roles('ADMIN')
  @Put('projects/:projectId/backlog-hierarchy')
  @ApiOkResponse({ description: 'Replaces project backlog hierarchy.' })
  configureProjectBacklogHierarchy(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: ConfigureBacklogHierarchyDto,
  ) {
    return this.workItemTypesService.configureProjectBacklogHierarchy(user, projectId, dto);
  }
}
