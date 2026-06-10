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
  color: string;
  icon: string;
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
