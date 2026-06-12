'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type {
  Project,
  WorkItem,
  WorkItemAttachment,
  WorkItemComment,
  WorkItemHistory,
  WorkItemsPage,
  WorkflowStatus,
  WorkItemType,
} from '@/lib/types';

type ProjectWorkItemsViewProps = {
  project: Project;
  workItemTypes: WorkItemType[];
  statuses: WorkflowStatus[];
};

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const emptyWorkItemForm = {
  typeId: '',
  statusId: '',
  parentId: '',
  assigneeId: '',
  title: '',
  description: '',
  acceptanceCriteria: '',
  priority: 'MEDIUM',
  estimate: '',
  sprintKey: '',
  tags: '',
};

export function ProjectWorkItemsView({
  project,
  workItemTypes,
  statuses,
}: ProjectWorkItemsViewProps) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [comments, setComments] = useState<WorkItemComment[]>([]);
  const [attachments, setAttachments] = useState<WorkItemAttachment[]>([]);
  const [history, setHistory] = useState<WorkItemHistory[]>([]);
  const [filters, setFilters] = useState({
    typeId: '',
    statusId: '',
    assigneeId: '',
    priority: '',
    tag: '',
  });
  const [form, setForm] = useState(emptyWorkItemForm);
  const [editForm, setEditForm] = useState(emptyWorkItemForm);
  const [commentBody, setCommentBody] = useState('');
  const [attachmentForm, setAttachmentForm] = useState({
    fileName: '',
    contentType: '',
    sizeBytes: '',
    storageKey: '',
    url: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const enabledTypes = useMemo(
    () => workItemTypes.filter((type) => type.isEnabledForProject !== false && type.isActive),
    [workItemTypes],
  );

  const selectableParents = useMemo(
    () => items.filter((item) => item.id !== selectedItem?.id),
    [items, selectedItem],
  );

  async function loadItems() {
    setError(null);
    setIsLoading(true);

    try {
      const query = new URLSearchParams();
      query.set('page', '1');
      query.set('pageSize', '50');
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query.set(key, value);
        }
      });
      const response = await apiFetch<WorkItemsPage>(
        `/projects/${project.id}/work-items?${query.toString()}`,
      );
      setItems(response.data);

      if (selectedItem) {
        const refreshedSelection = response.data.find((item) => item.id === selectedItem.id);
        setSelectedItem(refreshedSelection ?? null);
      }
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar work items.'));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadItemSideData(item: WorkItem) {
    setError(null);

    try {
      const [commentsResponse, attachmentsResponse, historyResponse] = await Promise.all([
        apiFetch<WorkItemComment[]>(`/projects/${project.id}/work-items/${item.id}/comments`),
        apiFetch<WorkItemAttachment[]>(`/projects/${project.id}/work-items/${item.id}/attachments`),
        apiFetch<WorkItemHistory[]>(`/projects/${project.id}/work-items/${item.id}/history`),
      ]);
      setComments(commentsResponse);
      setAttachments(attachmentsResponse);
      setHistory(historyResponse);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar colaboracao do item.'));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const created = await apiFetch<WorkItem>(`/projects/${project.id}/work-items`, {
        method: 'POST',
        body: JSON.stringify(toWorkItemPayload(form)),
      });
      setItems((currentItems) => [created, ...currentItems]);
      setForm(emptyWorkItemForm);
      selectItem(created);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar o work item.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await apiFetch<WorkItem>(
        `/projects/${project.id}/work-items/${selectedItem.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(toWorkItemPayload(editForm, true)),
        },
      );
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedItem(updated);
      setEditForm(fromWorkItem(updated));
      await loadItemSideData(updated);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel atualizar o work item.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!selectedItem) {
      return;
    }

    setError(null);

    try {
      await apiFetch<WorkItem>(`/projects/${project.id}/work-items/${selectedItem.id}`, {
        method: 'DELETE',
      });
      setItems((currentItems) => currentItems.filter((item) => item.id !== selectedItem.id));
      setSelectedItem(null);
      setComments([]);
      setAttachments([]);
      setHistory([]);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel arquivar o work item.'));
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      return;
    }

    setError(null);

    try {
      await apiFetch<WorkItemComment>(`/projects/${project.id}/work-items/${selectedItem.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody }),
      });
      setCommentBody('');
      await loadItemSideData(selectedItem);
      await loadItems();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel comentar.'));
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!selectedItem) {
      return;
    }

    await apiFetch<{ success: boolean }>(
      `/projects/${project.id}/work-items/${selectedItem.id}/comments/${commentId}`,
      { method: 'DELETE' },
    );
    await loadItemSideData(selectedItem);
    await loadItems();
  }

  async function handleAddAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      return;
    }

    setError(null);

    try {
      await apiFetch<WorkItemAttachment>(
        `/projects/${project.id}/work-items/${selectedItem.id}/attachments`,
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: attachmentForm.fileName,
            contentType: attachmentForm.contentType || undefined,
            sizeBytes: Number(attachmentForm.sizeBytes || 0),
            storageKey: attachmentForm.storageKey,
            url: attachmentForm.url || undefined,
          }),
        },
      );
      setAttachmentForm({ fileName: '', contentType: '', sizeBytes: '', storageKey: '', url: '' });
      await loadItemSideData(selectedItem);
      await loadItems();
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel registrar anexo.'));
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!selectedItem) {
      return;
    }

    await apiFetch<{ success: boolean }>(
      `/projects/${project.id}/work-items/${selectedItem.id}/attachments/${attachmentId}`,
      { method: 'DELETE' },
    );
    await loadItemSideData(selectedItem);
    await loadItems();
  }

  function selectItem(item: WorkItem) {
    setSelectedItem(item);
    setEditForm(fromWorkItem(item));
    void loadItemSideData(item);
  }

  useEffect(() => {
    if (!form.typeId && enabledTypes[0]) {
      setForm((currentForm) => ({ ...currentForm, typeId: enabledTypes[0].id }));
    }
  }, [enabledTypes, form.typeId]);

  useEffect(() => {
    void loadItems();
  }, [project.id, filters]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-md border border-border bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <SelectField
              label="Tipo"
              value={filters.typeId}
              onChange={(value) => setFilters((current) => ({ ...current, typeId: value }))}
              options={[{ label: 'Todos', value: '' }, ...enabledTypes.map(toOption)]}
            />
            <SelectField
              label="Status"
              value={filters.statusId}
              onChange={(value) => setFilters((current) => ({ ...current, statusId: value }))}
              options={[{ label: 'Todos', value: '' }, ...statuses.map(toOption)]}
            />
            <SelectField
              label="Responsavel"
              value={filters.assigneeId}
              onChange={(value) => setFilters((current) => ({ ...current, assigneeId: value }))}
              options={[
                { label: 'Todos', value: '' },
                ...project.members.map((member) => ({
                  label: member.user.name,
                  value: member.userId,
                })),
              ]}
            />
            <SelectField
              label="Prioridade"
              value={filters.priority}
              onChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
              options={[{ label: 'Todas', value: '' }, ...priorities.map((priority) => ({ label: priority, value: priority }))]}
            />
            <TextField
              label="Tag"
              value={filters.tag}
              onChange={(value) => setFilters((current) => ({ ...current, tag: value }))}
            />
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={loadItems}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </button>
          </div>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <form className="rounded-md border border-border bg-white p-4" onSubmit={handleCreate}>
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Novo work item</h3>
          </div>
          <WorkItemForm
            form={form}
            project={project}
            types={enabledTypes}
            statuses={statuses}
            parents={items}
            onChange={setForm}
          />
          <button
            className="mt-4 flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            type="submit"
            disabled={isSaving || !form.typeId}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Criar item
          </button>
        </form>

        <div className="overflow-hidden rounded-md border border-border bg-white">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Responsavel</th>
                    <th className="px-4 py-3 font-medium">Prioridade</th>
                    <th className="px-4 py-3 font-medium">Sinais</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={`cursor-pointer border-b border-border last:border-b-0 hover:bg-slate-50 ${
                        selectedItem?.id === item.id ? 'bg-slate-50' : ''
                      }`}
                      onClick={() => selectItem(item)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.parent ? `Pai: ${item.parent.title}` : 'Sem item pai'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={item.type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.assignee?.name ?? 'Nao atribuido'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>{item.counts.comments} com.</span>
                          <span>{item.counts.attachments} anx.</span>
                          <span>{item.counts.historyEntries} hist.</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nenhum work item encontrado para os filtros atuais.
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        {selectedItem ? (
          <>
            <section className="rounded-md border border-border bg-white p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Detalhe do item</h3>
                  <p className="mt-1 text-xs text-slate-500">{selectedItem.id}</p>
                </div>
                <button
                  className="flex h-8 items-center gap-2 rounded-md border border-red-200 px-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                  type="button"
                  onClick={handleArchive}
                >
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  Arquivar
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <WorkItemForm
                  form={editForm}
                  project={project}
                  types={enabledTypes}
                  statuses={statuses}
                  parents={selectableParents}
                  onChange={setEditForm}
                  compact
                />
                <button
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                  type="submit"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar alteracoes
                </button>
              </form>
            </section>

            <section className="rounded-md border border-border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Trabalho relacionado</h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-slate-500">Parent</p>
                  {selectedItem.parent ? (
                    <button
                      className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-slate-50"
                      type="button"
                      onClick={() => {
                        const parent = items.find((item) => item.id === selectedItem.parent?.id);

                        if (parent) {
                          selectItem(parent);
                        }
                      }}
                    >
                      {selectedItem.parent.title}
                    </button>
                  ) : (
                    <EmptySmall text="Sem parent. Este item esta no topo permitido pela hierarquia." />
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase text-slate-500">
                    Child ({selectedItem.children.length})
                  </p>
                  <div className="space-y-2">
                    {selectedItem.children.map((child) => (
                      <button
                        key={child.id}
                        className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-slate-50"
                        type="button"
                        onClick={() => {
                          const childItem = items.find((item) => item.id === child.id);

                          if (childItem) {
                            selectItem(childItem);
                          }
                        }}
                      >
                        <span className="min-w-0 truncate">{child.title}</span>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                          {child.type.name}
                        </span>
                      </button>
                    ))}
                    {!selectedItem.children.length ? <EmptySmall text="Nenhum child cadastrado." /> : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-white p-4">
              <PanelTitle icon={MessageSquare} title="Comentarios" />
              <form className="mb-3 flex gap-2" onSubmit={handleAddComment}>
                <input
                  className="h-10 min-w-0 flex-1 rounded-md border border-border px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  value={commentBody}
                  placeholder="Adicionar comentario"
                  onChange={(event) => setCommentBody(event.target.value)}
                  required
                />
                <button className="rounded-md bg-primary px-3 text-sm font-medium text-white" type="submit">
                  Enviar
                </button>
              </form>
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-md border border-border p-3">
                    <div className="flex justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">{comment.author.name}</p>
                      <button
                        className="text-slate-400 hover:text-red-600"
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        aria-label="Remover comentario"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-6">{comment.body}</p>
                  </div>
                ))}
                {!comments.length ? <EmptySmall text="Nenhum comentario." /> : null}
              </div>
            </section>

            <section className="rounded-md border border-border bg-white p-4">
              <PanelTitle icon={Paperclip} title="Anexos" />
              <form className="grid gap-2" onSubmit={handleAddAttachment}>
                <TextField
                  label="Arquivo"
                  value={attachmentForm.fileName}
                  onChange={(value) =>
                    setAttachmentForm((current) => ({ ...current, fileName: value }))
                  }
                  required
                />
                <TextField
                  label="Storage key"
                  value={attachmentForm.storageKey}
                  onChange={(value) =>
                    setAttachmentForm((current) => ({ ...current, storageKey: value }))
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    label="Tipo"
                    value={attachmentForm.contentType}
                    onChange={(value) =>
                      setAttachmentForm((current) => ({ ...current, contentType: value }))
                    }
                  />
                  <TextField
                    label="Bytes"
                    type="number"
                    value={attachmentForm.sizeBytes}
                    onChange={(value) =>
                      setAttachmentForm((current) => ({ ...current, sizeBytes: value }))
                    }
                    required
                  />
                </div>
                <TextField
                  label="URL"
                  value={attachmentForm.url}
                  onChange={(value) => setAttachmentForm((current) => ({ ...current, url: value }))}
                />
                <button className="h-9 rounded-md bg-primary text-sm font-medium text-white" type="submit">
                  Registrar anexo
                </button>
              </form>
              <div className="mt-3 space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                      <p className="truncate text-xs text-slate-500">{attachment.storageKey}</p>
                    </div>
                    <button
                      className="text-slate-400 hover:text-red-600"
                      type="button"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      aria-label="Remover anexo"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {!attachments.length ? <EmptySmall text="Nenhum anexo." /> : null}
              </div>
            </section>

            <section className="rounded-md border border-border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Historico</h3>
              <div className="space-y-2">
                {history.map((entry) => (
                  <div key={entry.id} className="rounded-md bg-slate-50 px-3 py-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-slate-500">{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      {entry.field ?? 'item'}: {entry.oldValue ?? 'vazio'} {'->'}{' '}
                      {entry.newValue ?? 'vazio'}
                    </p>
                    <p className="mt-1 text-slate-500">{entry.actor?.name ?? 'Sistema'}</p>
                  </div>
                ))}
                {!history.length ? <EmptySmall text="Nenhum historico." /> : null}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Selecione um work item para editar, comentar, anexar arquivos e consultar historico.
          </section>
        )}
      </aside>
    </div>
  );
}

type WorkItemFormState = typeof emptyWorkItemForm;

function WorkItemForm({
  form,
  project,
  types,
  statuses,
  parents,
  compact = false,
  onChange,
}: {
  form: WorkItemFormState;
  project: Project;
  types: WorkItemType[];
  statuses: WorkflowStatus[];
  parents: WorkItem[];
  compact?: boolean;
  onChange: (form: WorkItemFormState) => void;
}) {
  const gridClass = compact ? 'grid gap-3' : 'grid gap-3 lg:grid-cols-4';

  return (
    <div className={gridClass}>
      <SelectField
        label="Tipo"
        value={form.typeId}
        onChange={(value) => onChange({ ...form, typeId: value })}
        options={types.map(toOption)}
        required
      />
      <SelectField
        label="Status"
        value={form.statusId}
        onChange={(value) => onChange({ ...form, statusId: value })}
        options={[{ label: 'Inicial', value: '' }, ...statuses.map(toOption)]}
      />
      <SelectField
        label="Pai"
        value={form.parentId}
        onChange={(value) => onChange({ ...form, parentId: value })}
        options={[{ label: 'Sem pai', value: '' }, ...parents.map((item) => ({ label: item.title, value: item.id }))]}
      />
      <SelectField
        label="Responsavel"
        value={form.assigneeId}
        onChange={(value) => onChange({ ...form, assigneeId: value })}
        options={[
          { label: 'Nao atribuido', value: '' },
          ...project.members.map((member) => ({ label: member.user.name, value: member.userId })),
        ]}
      />
      <div className={compact ? '' : 'lg:col-span-2'}>
        <TextField
          label="Titulo"
          value={form.title}
          onChange={(value) => onChange({ ...form, title: value })}
          required
        />
      </div>
      <SelectField
        label="Prioridade"
        value={form.priority}
        onChange={(value) => onChange({ ...form, priority: value })}
        options={priorities.map((priority) => ({ label: priority, value: priority }))}
      />
      <TextField
        label="Estimativa"
        type="number"
        value={form.estimate}
        onChange={(value) => onChange({ ...form, estimate: value })}
      />
      <TextField
        label="Sprint"
        value={form.sprintKey}
        onChange={(value) => onChange({ ...form, sprintKey: value })}
      />
      <TextField
        label="Tags"
        value={form.tags}
        onChange={(value) => onChange({ ...form, tags: value })}
      />
      <div className={compact ? '' : 'lg:col-span-2'}>
        <TextAreaField
          label="Descricao"
          value={form.description}
          onChange={(value) => onChange({ ...form, description: value })}
        />
      </div>
      <div className={compact ? '' : 'lg:col-span-2'}>
        <TextAreaField
          label="Criterios de aceite"
          value={form.acceptanceCriteria}
          onChange={(value) => onChange({ ...form, acceptanceCriteria: value })}
        />
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
        className="min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
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

function PanelTitle({ title, icon: Icon }: { title: string; icon: typeof MessageSquare }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function TypeBadge({ type }: { type: WorkItemType }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs font-medium">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: type.color ?? '#64748B' }}
      />
      {type.name}
    </span>
  );
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: status.color ?? '#64748B' }}
      />
      {status.name}
    </span>
  );
}

function EmptySmall({ text }: { text: string }) {
  return <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">{text}</p>;
}

function toWorkItemPayload(form: WorkItemFormState, includeEmptyStatus = false) {
  return {
    typeId: form.typeId,
    statusId: form.statusId || (includeEmptyStatus ? null : undefined),
    parentId: form.parentId || null,
    assigneeId: form.assigneeId || null,
    title: form.title,
    description: form.description || null,
    acceptanceCriteria: form.acceptanceCriteria || null,
    priority: form.priority,
    estimate: form.estimate ? Number(form.estimate) : null,
    sprintKey: form.sprintKey || null,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function fromWorkItem(item: WorkItem): WorkItemFormState {
  return {
    typeId: item.type.id,
    statusId: item.status.id,
    parentId: item.parent?.id ?? '',
    assigneeId: item.assignee?.id ?? '',
    title: item.title,
    description: item.description ?? '',
    acceptanceCriteria: item.acceptanceCriteria ?? '',
    priority: item.priority,
    estimate: item.estimate === null ? '' : String(item.estimate),
    sprintKey: item.sprintKey ?? '',
    tags: item.tags.join(', '),
  };
}

function toOption(item: { id: string; name: string }) {
  return { label: item.name, value: item.id };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}
