import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateWorkItemAttachmentDto } from './dto/create-work-item-attachment.dto';
import { CreateWorkItemCommentDto } from './dto/create-work-item-comment.dto';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { ListWorkItemsQueryDto } from './dto/list-work-items-query.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import { WorkItemsService } from './work-items.service';

@ApiBearerAuth()
@ApiTags('work-items')
@Controller('projects/:projectId/work-items')
export class WorkItemsController {
  constructor(private readonly workItemsService: WorkItemsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists project work items with filters and pagination.' })
  listWorkItems(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Query() query: ListWorkItemsQueryDto,
  ) {
    return this.workItemsService.listWorkItems(user, projectId, query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Creates a project work item.' })
  createWorkItem(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkItemDto,
  ) {
    return this.workItemsService.createWorkItem(user, projectId, dto);
  }

  @Get(':itemId')
  @ApiOkResponse({ description: 'Returns a work item detail.' })
  getWorkItem(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workItemsService.getWorkItem(user, projectId, itemId);
  }

  @Patch(':itemId')
  @ApiOkResponse({ description: 'Updates a work item.' })
  updateWorkItem(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateWorkItemDto,
  ) {
    return this.workItemsService.updateWorkItem(user, projectId, itemId, dto);
  }

  @Delete(':itemId')
  @ApiOkResponse({ description: 'Archives a work item.' })
  archiveWorkItem(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workItemsService.archiveWorkItem(user, projectId, itemId);
  }

  @Get(':itemId/comments')
  @ApiOkResponse({ description: 'Lists work item comments.' })
  listComments(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workItemsService.listComments(user, projectId, itemId);
  }

  @Post(':itemId/comments')
  @ApiCreatedResponse({ description: 'Adds a work item comment.' })
  addComment(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateWorkItemCommentDto,
  ) {
    return this.workItemsService.addComment(user, projectId, itemId, dto);
  }

  @Delete(':itemId/comments/:commentId')
  @ApiOkResponse({ description: 'Deletes a work item comment logically.' })
  deleteComment(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.workItemsService.deleteComment(user, projectId, itemId, commentId);
  }

  @Get(':itemId/attachments')
  @ApiOkResponse({ description: 'Lists work item attachments.' })
  listAttachments(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workItemsService.listAttachments(user, projectId, itemId);
  }

  @Post(':itemId/attachments')
  @ApiCreatedResponse({ description: 'Registers a work item attachment metadata.' })
  addAttachment(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateWorkItemAttachmentDto,
  ) {
    return this.workItemsService.addAttachment(user, projectId, itemId, dto);
  }

  @Delete(':itemId/attachments/:attachmentId')
  @ApiOkResponse({ description: 'Deletes a work item attachment logically.' })
  deleteAttachment(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.workItemsService.deleteAttachment(user, projectId, itemId, attachmentId);
  }

  @Get(':itemId/history')
  @ApiOkResponse({ description: 'Lists work item history entries.' })
  listHistory(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workItemsService.listHistory(user, projectId, itemId);
  }
}
