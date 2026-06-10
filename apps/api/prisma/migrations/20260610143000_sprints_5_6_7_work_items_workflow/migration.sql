-- CreateTable
CREATE TABLE "WorkflowStatus" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "color" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isInitial" BOOLEAN NOT NULL DEFAULT false,
  "isFinal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkflowStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "fromStatusId" UUID NOT NULL,
  "toStatusId" UUID NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "typeId" UUID NOT NULL,
  "statusId" UUID NOT NULL,
  "parentId" UUID,
  "assigneeId" UUID,
  "createdById" UUID NOT NULL,
  "updatedById" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "acceptanceCriteria" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "estimate" DOUBLE PRECISION,
  "sprintKey" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItemComment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workItemId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "mentions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "WorkItemComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItemAttachment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workItemId" UUID NOT NULL,
  "uploadedById" UUID NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT,
  "sizeBytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "url" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "WorkItemAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItemHistory" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workItemId" UUID NOT NULL,
  "actorId" UUID,
  "action" TEXT NOT NULL,
  "field" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkItemHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStatus_projectId_key_key" ON "WorkflowStatus"("projectId", "key");

-- CreateIndex
CREATE INDEX "WorkflowStatus_projectId_order_idx" ON "WorkflowStatus"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTransition_projectId_fromStatusId_toStatusId_key" ON "WorkflowTransition"("projectId", "fromStatusId", "toStatusId");

-- CreateIndex
CREATE INDEX "WorkflowTransition_projectId_idx" ON "WorkflowTransition"("projectId");

-- CreateIndex
CREATE INDEX "WorkItem_projectId_statusId_idx" ON "WorkItem"("projectId", "statusId");

-- CreateIndex
CREATE INDEX "WorkItem_projectId_typeId_idx" ON "WorkItem"("projectId", "typeId");

-- CreateIndex
CREATE INDEX "WorkItem_assigneeId_idx" ON "WorkItem"("assigneeId");

-- CreateIndex
CREATE INDEX "WorkItem_archivedAt_idx" ON "WorkItem"("archivedAt");

-- CreateIndex
CREATE INDEX "WorkItemComment_workItemId_idx" ON "WorkItemComment"("workItemId");

-- CreateIndex
CREATE INDEX "WorkItemAttachment_workItemId_idx" ON "WorkItemAttachment"("workItemId");

-- CreateIndex
CREATE INDEX "WorkItemHistory_workItemId_createdAt_idx" ON "WorkItemHistory"("workItemId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkflowStatus" ADD CONSTRAINT "WorkflowStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "WorkflowStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "WorkflowStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "WorkItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "WorkflowStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemComment" ADD CONSTRAINT "WorkItemComment_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemComment" ADD CONSTRAINT "WorkItemComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemAttachment" ADD CONSTRAINT "WorkItemAttachment_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemAttachment" ADD CONSTRAINT "WorkItemAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemHistory" ADD CONSTRAINT "WorkItemHistory_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemHistory" ADD CONSTRAINT "WorkItemHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
