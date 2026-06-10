'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Circle,
  Layers3,
  RefreshCw,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { BacklogHierarchyItem, Project, WorkItemType } from '@/lib/types';

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([]);
  const [hierarchy, setHierarchy] = useState<BacklogHierarchyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProject() {
    setError(null);
    setIsLoading(true);

    try {
      const [projectResponse, typeResponse, hierarchyResponse] = await Promise.all([
        apiFetch<Project>(`/projects/${projectId}`),
        apiFetch<WorkItemType[]>(`/projects/${projectId}/work-item-types`),
        apiFetch<BacklogHierarchyItem[]>(`/projects/${projectId}/backlog-hierarchy`),
      ]);

      setProject(projectResponse);
      setWorkItemTypes(typeResponse);
      setHierarchy(hierarchyResponse);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar o projeto.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProject();
  }, [projectId]);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error ?? 'Projeto nao encontrado.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
            href="/projects"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Projetos
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              {project.key}
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600">
              {project.status}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{project.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {project.description ?? 'Projeto sem descricao.'}
          </p>
        </div>
        <button
          className="flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={loadProject}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Atualizar
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <Panel icon={Layers3} title="Tipos de work items">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {workItemTypes.map((type) => (
                <div key={type.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-md text-xs font-semibold text-white"
                      style={{ backgroundColor: type.color }}
                    >
                      {type.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{type.name}</p>
                      <p className="text-xs text-slate-500">
                        {type.isEnabledForProject ? 'Ativo no projeto' : 'Inativo no projeto'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel icon={Circle} title="Hierarquia do backlog">
            {hierarchy.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 font-medium">Nivel</th>
                      <th className="px-3 py-2 font-medium">Tipo pai</th>
                      <th className="px-3 py-2 font-medium">Tipo filho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchy.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-3 font-medium">{item.level}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {item.parentType?.name ?? 'Raiz'}
                        </td>
                        <td className="px-3 py-3 text-slate-900">{item.childType.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                Hierarquia ainda nao configurada para este projeto.
              </p>
            )}
          </Panel>
        </section>

        <Panel icon={Users} title="Membros">
          <div className="space-y-2">
            {project.members.map((member) => (
              <div key={member.userId} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.user.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.user.email}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-48 animate-pulse rounded-md bg-white" />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="h-64 animate-pulse rounded-md bg-white" />
          <div className="h-56 animate-pulse rounded-md bg-white" />
        </div>
        <div className="h-72 animate-pulse rounded-md bg-white" />
      </div>
    </div>
  );
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}
