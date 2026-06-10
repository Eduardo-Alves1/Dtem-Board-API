-- CreateTable
CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "archivedAt" TIMESTAMP(3),

  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
  "projectId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId", "userId")
);

-- CreateTable
CREATE TABLE "WorkItemType" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectWorkItemType" (
  "projectId" UUID NOT NULL,
  "workItemTypeId" UUID NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectWorkItemType_pkey" PRIMARY KEY ("projectId", "workItemTypeId")
);

-- CreateTable
CREATE TABLE "ProjectBacklogHierarchy" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "parentTypeId" UUID,
  "childTypeId" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectBacklogHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_key_key" ON "Project"("key");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItemType_name_key" ON "WorkItemType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBacklogHierarchy_projectId_childTypeId_key" ON "ProjectBacklogHierarchy"("projectId", "childTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBacklogHierarchy_projectId_parentTypeId_childTypeId_key" ON "ProjectBacklogHierarchy"("projectId", "parentTypeId", "childTypeId");

-- CreateIndex
CREATE INDEX "ProjectBacklogHierarchy_projectId_level_idx" ON "ProjectBacklogHierarchy"("projectId", "level");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkItemType" ADD CONSTRAINT "ProjectWorkItemType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkItemType" ADD CONSTRAINT "ProjectWorkItemType_workItemTypeId_fkey" FOREIGN KEY ("workItemTypeId") REFERENCES "WorkItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBacklogHierarchy" ADD CONSTRAINT "ProjectBacklogHierarchy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBacklogHierarchy" ADD CONSTRAINT "ProjectBacklogHierarchy_parentTypeId_fkey" FOREIGN KEY ("parentTypeId") REFERENCES "WorkItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBacklogHierarchy" ADD CONSTRAINT "ProjectBacklogHierarchy_childTypeId_fkey" FOREIGN KEY ("childTypeId") REFERENCES "WorkItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
