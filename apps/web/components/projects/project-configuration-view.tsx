'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type {
  BacklogHierarchyItem,
  WorkflowStatus,
  WorkflowTransition,
  WorkItemType,
} from '@/lib/types';

type ProjectConfigurationViewProps = {
  projectId: string;
  initialProjectTypes: WorkItemType[];
  initialHierarchy: BacklogHierarchyItem[];
  initialStatuses: WorkflowStatus[];
  initialTransitions: WorkflowTransition[];
  onRefresh: () => Promise<void>;
};

const emptyTypeForm = {
  name: '',
  description: '',
  color: '#2563EB',
  icon: '',
};

const emptyStatusForm = {
  name: '',
  key: '',
  color: '#2563EB',
  order: '',
  isInitial: false,
  isFinal: false,
};

export function ProjectConfigurationView({
  projectId,
  initialProjectTypes,
  initialHierarchy,
  initialStatuses,
  initialTransitions,
  onRefresh,
}: ProjectConfigurationViewProps) {
  const [globalTypes, setGlobalTypes] = useState<WorkItemType[]>([]);
  const [enabledTypeIds, setEnabledTypeIds] = useState<string[]>([]);
  const [hierarchyDraft, setHierarchyDraft] = useState<HierarchyDraftItem[]>([]);
  const [statuses, setStatuses] = useState<WorkflowStatus[]>(initialStatuses);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>(initialTransitions);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [statusForm, setStatusForm] = useState(emptyStatusForm);
  const [transitionForm, setTransitionForm] = useState({ fromStatusId: '', toStatusId: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const enabledTypes = useMemo(
    () => globalTypes.filter((type) => enabledTypeIds.includes(type.id)),
    [enabledTypeIds, globalTypes],
  );

  async function loadGlobalTypes() {
    setError(null);

    try {
      const response = await apiFetch<WorkItemType[]>('/work-item-types');
      setGlobalTypes(response);
      const activeProjectTypeIds = initialProjectTypes
        .filter((type) => type.isEnabledForProject !== false)
        .map((type) => type.id);
      setEnabledTypeIds(activeProjectTypeIds.length ? activeProjectTypeIds : response.map((type) => type.id));
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar tipos globais.'));
    }
  }

  async function reloadWorkflow() {
    const [statusResponse, transitionResponse] = await Promise.all([
      apiFetch<WorkflowStatus[]>(`/projects/${projectId}/workflow/statuses`),
      apiFetch<WorkflowTransition[]>(`/projects/${projectId}/workflow/transitions`),
    ]);
    setStatuses(statusResponse);
    setTransitions(transitionResponse);
  }

  async function handleCreateType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const created = await apiFetch<WorkItemType>('/work-item-types', {
        method: 'POST',
        body: JSON.stringify({
          name: typeForm.name,
          description: typeForm.description || undefined,
          color: typeForm.color || undefined,
          icon: typeForm.icon || undefined,
        }),
      });
      setGlobalTypes((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setEnabledTypeIds((current) => [...new Set([...current, created.id])]);
      setTypeForm(emptyTypeForm);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar tipo.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchiveType(typeId: string) {
    setError(null);

    try {
      const archived = await apiFetch<WorkItemType>(`/work-item-types/${typeId}`, { method: 'DELETE' });
      setGlobalTypes((current) => current.map((type) => (type.id === typeId ? archived : type)));
      setEnabledTypeIds((current) => current.filter((id) => id !== typeId));
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel inativar tipo.'));
    }
  }

  async function handleSaveProjectTypes() {
    setIsSaving(true);
    setError(null);

    try {
      await apiFetch<WorkItemType[]>(`/projects/${projectId}/work-item-types`, {
        method: 'PUT',
        body: JSON.stringify({ workItemTypeIds: enabledTypeIds }),
      });
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel salvar tipos do projeto.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveHierarchy() {
    setIsSaving(true);
    setError(null);

    try {
      await apiFetch<BacklogHierarchyItem[]>(`/projects/${projectId}/backlog-hierarchy`, {
        method: 'PUT',
        body: JSON.stringify({
          hierarchy: hierarchyDraft.map((item) => ({
            parentTypeId: item.parentTypeId || undefined,
            childTypeId: item.childTypeId,
            level: Number(item.level),
          })),
        }),
      });
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel salvar hierarquia.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await apiFetch<WorkflowStatus>(`/projects/${projectId}/workflow/statuses`, {
        method: 'POST',
        body: JSON.stringify({
          name: statusForm.name,
          key: statusForm.key,
          color: statusForm.color || undefined,
          order: statusForm.order ? Number(statusForm.order) : undefined,
          isInitial: statusForm.isInitial,
          isFinal: statusForm.isFinal,
        }),
      });
      setStatusForm(emptyStatusForm);
      await reloadWorkflow();
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar status.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateStatus(status: WorkflowStatus) {
    setError(null);

    try {
      await apiFetch<WorkflowStatus>(`/projects/${projectId}/workflow/statuses/${status.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: status.name,
          key: status.key,
          color: status.color,
          order: status.order,
          isInitial: status.isInitial,
          isFinal: status.isFinal,
        }),
      });
      await reloadWorkflow();
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel atualizar status.'));
    }
  }

  async function handleDeleteStatus(statusId: string) {
    setError(null);

    try {
      await apiFetch<{ success: boolean }>(`/projects/${projectId}/workflow/statuses/${statusId}`, {
        method: 'DELETE',
      });
      await reloadWorkflow();
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel remover status.'));
    }
  }

  async function handleCreateTransition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await apiFetch<WorkflowTransition>(`/projects/${projectId}/workflow/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          fromStatusId: transitionForm.fromStatusId,
          toStatusId: transitionForm.toStatusId,
          name: transitionForm.name || undefined,
        }),
      });
      setTransitionForm({ fromStatusId: '', toStatusId: '', name: '' });
      await reloadWorkflow();
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar transicao.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTransition(transitionId: string) {
    setError(null);

    try {
      await apiFetch<{ success: boolean }>(
        `/projects/${projectId}/workflow/transitions/${transitionId}`,
        { method: 'DELETE' },
      );
      await reloadWorkflow();
      await onRefresh();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel remover transicao.'));
    }
  }

  function addHierarchyRow() {
    const childTypeId = enabledTypes[0]?.id ?? '';
    setHierarchyDraft((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        parentTypeId: '',
        childTypeId,
        level: String(current.length),
      },
    ]);
  }

  useEffect(() => {
    void loadGlobalTypes();
  }, [initialProjectTypes]);

  useEffect(() => {
    setStatuses(initialStatuses);
    setTransitions(initialTransitions);
  }, [initialStatuses, initialTransitions]);

  useEffect(() => {
    setHierarchyDraft(
      initialHierarchy.map((item) => ({
        localId: item.id,
        parentTypeId: item.parentType?.id ?? '',
        childTypeId: item.childType.id,
        level: String(item.level),
      })),
    );
  }, [initialHierarchy]);

  return (
    <div className="space-y-5">
      {error ? <ErrorMessage message={error} /> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-md border border-border bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Tipos habilitados no projeto</h3>
              <p className="mt-1 text-xs text-slate-500">
                Estes tipos ficam disponiveis para criacao de work items.
              </p>
            </div>
            <button
              className="flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white"
              type="button"
              onClick={handleSaveProjectTypes}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Salvar
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {globalTypes.map((type) => (
              <label
                key={type.id}
                className={`flex items-center justify-between gap-3 rounded-md border p-3 text-sm ${
                  type.isActive ? 'border-border' : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: type.color ?? '#64748B' }}
                  />
                  <span className="truncate font-medium">{type.name}</span>
                </span>
                <input
                  type="checkbox"
                  checked={enabledTypeIds.includes(type.id)}
                  disabled={!type.isActive}
                  onChange={(event) => {
                    setEnabledTypeIds((current) =>
                      event.target.checked
                        ? [...new Set([...current, type.id])]
                        : current.filter((id) => id !== type.id),
                    );
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <form className="rounded-md border border-border bg-white p-4" onSubmit={handleCreateType}>
          <h3 className="text-sm font-semibold">Novo tipo global</h3>
          <div className="mt-4 grid gap-3">
            <TextField label="Nome" value={typeForm.name} onChange={(name) => setTypeForm((current) => ({ ...current, name }))} required />
            <TextField label="Icone" value={typeForm.icon} onChange={(icon) => setTypeForm((current) => ({ ...current, icon }))} />
            <TextField label="Cor" value={typeForm.color} onChange={(color) => setTypeForm((current) => ({ ...current, color }))} required />
            <TextAreaField label="Descricao" value={typeForm.description} onChange={(description) => setTypeForm((current) => ({ ...current, description }))} />
            <button className="h-10 rounded-md bg-primary text-sm font-medium text-white" type="submit" disabled={isSaving}>
              Criar tipo
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {globalTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-xs">
                <span className="truncate">{type.name}</span>
                <button
                  className="text-slate-400 hover:text-red-600 disabled:opacity-40"
                  type="button"
                  disabled={!type.isActive}
                  onClick={() => handleArchiveType(type.id)}
                  aria-label="Inativar tipo"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </form>
      </section>

      <section className="rounded-md border border-border bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Hierarquia do backlog</h3>
            <p className="mt-1 text-xs text-slate-500">
              Defina raiz e relacoes pai-filho validas para work items.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="h-9 rounded-md border border-border px-3 text-sm font-medium" type="button" onClick={addHierarchyRow}>
              Adicionar linha
            </button>
            <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-white" type="button" onClick={handleSaveHierarchy} disabled={isSaving}>
              Salvar hierarquia
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {hierarchyDraft.map((item) => (
            <div key={item.localId} className="grid gap-2 md:grid-cols-[1fr_1fr_100px_40px]">
              <SelectField
                label="Tipo pai"
                value={item.parentTypeId}
                onChange={(parentTypeId) =>
                  setHierarchyDraft((current) =>
                    current.map((row) => (row.localId === item.localId ? { ...row, parentTypeId } : row)),
                  )
                }
                options={[{ label: 'Raiz', value: '' }, ...enabledTypes.map(toOption)]}
              />
              <SelectField
                label="Tipo filho"
                value={item.childTypeId}
                onChange={(childTypeId) =>
                  setHierarchyDraft((current) =>
                    current.map((row) => (row.localId === item.localId ? { ...row, childTypeId } : row)),
                  )
                }
                options={enabledTypes.map(toOption)}
              />
              <TextField
                label="Nivel"
                type="number"
                value={item.level}
                onChange={(level) =>
                  setHierarchyDraft((current) =>
                    current.map((row) => (row.localId === item.localId ? { ...row, level } : row)),
                  )
                }
                required
              />
              <button
                className="mt-6 grid h-10 place-items-center rounded-md border border-border text-slate-500 hover:bg-slate-50"
                type="button"
                onClick={() => setHierarchyDraft((current) => current.filter((row) => row.localId !== item.localId))}
                aria-label="Remover linha"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {!hierarchyDraft.length ? (
            <p className="rounded-md bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              Nenhuma hierarquia configurada.
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-md border border-border bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Status do workflow</h3>
            <button className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium" type="button" onClick={reloadWorkflow}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </button>
          </div>
          <div className="space-y-3">
            {statuses.map((status) => (
              <StatusEditor
                key={status.id}
                status={status}
                onChange={(updated) =>
                  setStatuses((current) => current.map((item) => (item.id === updated.id ? updated : item)))
                }
                onSave={handleUpdateStatus}
                onDelete={handleDeleteStatus}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <form className="rounded-md border border-border bg-white p-4" onSubmit={handleCreateStatus}>
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Novo status</h3>
            </div>
            <div className="grid gap-3">
              <TextField label="Nome" value={statusForm.name} onChange={(name) => setStatusForm((current) => ({ ...current, name }))} required />
              <TextField label="Chave" value={statusForm.key} onChange={(key) => setStatusForm((current) => ({ ...current, key: key.toUpperCase() }))} required />
              <TextField label="Cor" value={statusForm.color} onChange={(color) => setStatusForm((current) => ({ ...current, color }))} />
              <TextField label="Ordem" type="number" value={statusForm.order} onChange={(order) => setStatusForm((current) => ({ ...current, order }))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={statusForm.isInitial} onChange={(event) => setStatusForm((current) => ({ ...current, isInitial: event.target.checked }))} />
                Inicial
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={statusForm.isFinal} onChange={(event) => setStatusForm((current) => ({ ...current, isFinal: event.target.checked }))} />
                Final
              </label>
              <button className="h-10 rounded-md bg-primary text-sm font-medium text-white" type="submit" disabled={isSaving}>
                Criar status
              </button>
            </div>
          </form>

          <form className="rounded-md border border-border bg-white p-4" onSubmit={handleCreateTransition}>
            <h3 className="text-sm font-semibold">Nova transicao</h3>
            <div className="mt-4 grid gap-3">
              <SelectField label="De" value={transitionForm.fromStatusId} onChange={(fromStatusId) => setTransitionForm((current) => ({ ...current, fromStatusId }))} options={statuses.map(toOption)} required />
              <SelectField label="Para" value={transitionForm.toStatusId} onChange={(toStatusId) => setTransitionForm((current) => ({ ...current, toStatusId }))} options={statuses.map(toOption)} required />
              <TextField label="Nome" value={transitionForm.name} onChange={(name) => setTransitionForm((current) => ({ ...current, name }))} />
              <button className="h-10 rounded-md bg-primary text-sm font-medium text-white" type="submit" disabled={isSaving}>
                Criar transicao
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {transitions.map((transition) => (
                <div key={transition.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {transition.fromStatus.name} {'->'} {transition.toStatus.name}
                  </span>
                  <button className="text-slate-400 hover:text-red-600" type="button" onClick={() => handleDeleteTransition(transition.id)} aria-label="Remover transicao">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

type HierarchyDraftItem = {
  localId: string;
  parentTypeId: string;
  childTypeId: string;
  level: string;
};

function StatusEditor({
  status,
  onChange,
  onSave,
  onDelete,
}: {
  status: WorkflowStatus;
  onChange: (status: WorkflowStatus) => void;
  onSave: (status: WorkflowStatus) => void;
  onDelete: (statusId: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_160px_120px_80px_80px_80px]">
      <TextField label="Nome" value={status.name} onChange={(name) => onChange({ ...status, name })} />
      <TextField label="Chave" value={status.key} onChange={(key) => onChange({ ...status, key: key.toUpperCase() })} />
      <TextField label="Cor" value={status.color ?? ''} onChange={(color) => onChange({ ...status, color })} />
      <TextField label="Ordem" type="number" value={String(status.order)} onChange={(order) => onChange({ ...status, order: Number(order || 0) })} />
      <label className="mt-6 flex items-center gap-2 text-xs">
        <input type="checkbox" checked={status.isInitial} onChange={(event) => onChange({ ...status, isInitial: event.target.checked })} />
        Inicial
      </label>
      <label className="mt-6 flex items-center gap-2 text-xs">
        <input type="checkbox" checked={status.isFinal} onChange={(event) => onChange({ ...status, isFinal: event.target.checked })} />
        Final
      </label>
      <div className="flex gap-2 md:col-span-6">
        <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-white" type="button" onClick={() => onSave(status)}>
          Salvar
        </button>
        <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700" type="button" onClick={() => onDelete(status.id)}>
          Remover
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <select
        className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  type = 'text',
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <textarea
        className="min-h-20 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function toOption(item: { id: string; name: string }) {
  return { label: item.name, value: item.id };
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}
