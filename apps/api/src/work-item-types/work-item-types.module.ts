import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { WorkItemTypesController } from './work-item-types.controller';
import { WorkItemTypesService } from './work-item-types.service';

@Module({
  imports: [ProjectsModule],
  controllers: [WorkItemTypesController],
  providers: [WorkItemTypesService],
})
export class WorkItemTypesModule {}
