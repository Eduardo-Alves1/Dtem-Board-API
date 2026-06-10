export type ProjectMember = {
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
};

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  members: ProjectMember[];
};

export type WorkItemType = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  isEnabledForProject?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BacklogHierarchyItem = {
  id: string;
  level: number;
  parentType: WorkItemType | null;
  childType: WorkItemType;
  createdAt: string;
};

export type Role = {
  id: string;
  name: string;
  description: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStatus = {
  id: string;
  projectId: string;
  name: string;
  key: string;
  color: string | null;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowTransition = {
  id: string;
  projectId: string;
  name: string | null;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  createdAt: string;
};

export type WorkItemSummary = {
  comments: number;
  attachments: number;
  historyEntries: number;
};

export type WorkItem = {
  id: string;
  projectId: string;
  type: WorkItemType;
  status: WorkflowStatus;
  parent: {
    id: string;
    title: string;
    typeId: string;
  } | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  priority: string;
  estimate: number | null;
  sprintKey: string | null;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  counts: WorkItemSummary;
};

export type WorkItemsPage = {
  data: WorkItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};

export type WorkItemComment = {
  id: string;
  workItemId: string;
  authorId: string;
  body: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

export type WorkItemAttachment = {
  id: string;
  workItemId: string;
  uploadedById: string;
  fileName: string;
  contentType: string | null;
  sizeBytes: number;
  storageKey: string;
  url: string | null;
  createdAt: string;
  deletedAt: string | null;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type WorkItemHistory = {
  id: string;
  workItemId: string;
  actorId: string | null;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
};
