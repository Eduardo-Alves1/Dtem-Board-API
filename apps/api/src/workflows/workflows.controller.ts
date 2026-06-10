import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { CreateWorkflowStatusDto } from './dto/create-workflow-status.dto';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto';
import { UpdateWorkflowStatusDto } from './dto/update-workflow-status.dto';
import { WorkflowsService } from './workflows.service';

@ApiBearerAuth()
@ApiTags('workflows')
@Controller('projects/:projectId/workflow')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('statuses')
  @ApiOkResponse({ description: 'Lists workflow statuses for a project.' })
  listStatuses(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    return this.workflowsService.listStatuses(user, projectId);
  }

  @Roles('ADMIN')
  @Post('statuses')
  @ApiCreatedResponse({ description: 'Creates a workflow status.' })
  createStatus(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowStatusDto,
  ) {
    return this.workflowsService.createStatus(user, projectId, dto);
  }

  @Roles('ADMIN')
  @Patch('statuses/:statusId')
  @ApiOkResponse({ description: 'Updates a workflow status.' })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
    @Body() dto: UpdateWorkflowStatusDto,
  ) {
    return this.workflowsService.updateStatus(user, projectId, statusId, dto);
  }

  @Roles('ADMIN')
  @Delete('statuses/:statusId')
  @ApiOkResponse({ description: 'Deletes an unused workflow status.' })
  deleteStatus(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
  ) {
    return this.workflowsService.deleteStatus(user, projectId, statusId);
  }

  @Get('transitions')
  @ApiOkResponse({ description: 'Lists allowed workflow transitions for a project.' })
  listTransitions(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    return this.workflowsService.listTransitions(user, projectId);
  }

  @Roles('ADMIN')
  @Post('transitions')
  @ApiCreatedResponse({ description: 'Creates an allowed workflow transition.' })
  createTransition(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowTransitionDto,
  ) {
    return this.workflowsService.createTransition(user, projectId, dto);
  }

  @Roles('ADMIN')
  @Delete('transitions/:transitionId')
  @ApiOkResponse({ description: 'Deletes an allowed workflow transition.' })
  deleteTransition(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('transitionId') transitionId: string,
  ) {
    return this.workflowsService.deleteTransition(user, projectId, transitionId);
  }
}
