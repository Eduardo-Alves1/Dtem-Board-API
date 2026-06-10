'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, FolderKanban, Plus, RefreshCw, Search } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { isAdmin, type AuthUser } from '@/lib/auth';
import type { Project } from '@/lib/types';

type ProjectsViewProps = {
  user: AuthUser;
};

export function ProjectsView({ user }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', key: '', description: '' });
  const canCreate = isAdmin(user);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return projects;
    }

    return projects.filter((project) =>
      [project.name, project.key, project.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [projects, query]);

  async function loadProjects() {
    setError(null);
    setIsLoading(true);

    try {
      setProjects(await apiFetch<Project[]>('/projects'));
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar os projetos.'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const createdProject = await apiFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          key: form.key.trim(),
          description: form.description.trim() || undefined,
        }),
      });
      setProjects((currentProjects) => [createdProject, ...currentProjects]);
      setForm({ name: '', key: '', description: '' });
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar o projeto.'));
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              placeholder="Buscar projeto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={loadProjects}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar
          </button>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <ProjectSkeleton />
        ) : filteredProjects.length ? (
          <div className="grid gap-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                className="rounded-md border border-border bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                href={`/projects/${project.id}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                        {project.key}
                      </span>
                      <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600">
                        {project.status}
                      </span>
                    </div>
                    <h2 className="mt-3 text-base font-semibold">{project.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {project.description ?? 'Projeto sem descricao.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm md:w-52">
                    <Metric label="Membros" value={String(project.members.length)} />
                    <Metric label="Atualizado" value={formatDate(project.updatedAt)} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyProjects />
        )}
      </section>

      {canCreate ? (
        <section className="rounded-md border border-border bg-white p-4 xl:sticky xl:top-20 xl:self-start">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Novo projeto</h2>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleCreateProject}>
            <Field
              label="Nome"
              value={form.name}
              onChange={(value) => setForm((currentForm) => ({ ...currentForm, name: value }))}
              required
            />
            <Field
              label="Chave"
              maxLength={12}
              value={form.key}
              onChange={(value) =>
                setForm((currentForm) => ({ ...currentForm, key: value.toUpperCase() }))
              }
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="project-description">
                Descricao
              </label>
              <textarea
                id="project-description"
                className="min-h-24 w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                value={form.description}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isCreating ? 'Criando...' : 'Criar projeto'}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  const id = `project-${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={value}
        maxLength={maxLength}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-md bg-white" />
      ))}
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-slate-300 bg-white px-6 text-center">
      <div>
        <FolderKanban className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold">Nenhum projeto encontrado</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Projetos criados ou liberados para seu usuario aparecem nesta lista.
        </p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}
