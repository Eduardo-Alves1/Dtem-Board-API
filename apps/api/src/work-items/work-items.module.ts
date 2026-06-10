import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { WorkItemsController } from './work-items.controller';
import { WorkItemsService } from './work-items.service';

@Module({
  imports: [ProjectsModule, WorkflowsModule],
  controllers: [WorkItemsController],
  providers: [WorkItemsService],
})
export class WorkItemsModule {}
