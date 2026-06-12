'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, Edit3, Plus, RefreshCw, Save, ShieldCheck, Users } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Role, User } from '@/lib/types';

export function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['VIEWER']);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    isActive: true,
    roles: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function loadUsers() {
    setError(null);
    setIsLoading(true);

    try {
      const [userResponse, roleResponse] = await Promise.all([
        apiFetch<User[]>('/users'),
        apiFetch<Role[]>('/users/roles'),
      ]);
      setUsers(userResponse);
      setRoles(roleResponse);
      if (selectedUser) {
        const refreshedUser = userResponse.find((user) => user.id === selectedUser.id) ?? null;
        setSelectedUser(refreshedUser);

        if (refreshedUser) {
          setEditForm(fromUser(refreshedUser));
        }
      }
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel carregar usuarios.'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const createdUser = await apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          roles: selectedRoles,
        }),
      });

      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setForm({ name: '', email: '', password: '' });
      setSelectedRoles(['VIEWER']);
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel criar o usuario.'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    setError(null);
    setIsUpdating(true);

    try {
      const updatedUser = await apiFetch<User>(`/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          isActive: editForm.isActive,
        }),
      });
      const updatedRolesUser = await apiFetch<User>(`/users/${selectedUser.id}/roles`, {
        method: 'PATCH',
        body: JSON.stringify({ roles: editForm.roles }),
      });
      const finalUser = { ...updatedUser, roles: updatedRolesUser.roles };
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === finalUser.id ? finalUser : user)),
      );
      setSelectedUser(finalUser);
      setEditForm(fromUser(finalUser));
    } catch (caughtError) {
      setError(readError(caughtError, 'Nao foi possivel atualizar o usuario.'));
    } finally {
      setIsUpdating(false);
    }
  }

  function toggleRole(roleName: string) {
    setSelectedRoles((currentRoles) => {
      if (currentRoles.includes(roleName)) {
        const nextRoles = currentRoles.filter((role) => role !== roleName);
        return nextRoles.length ? nextRoles : ['VIEWER'];
      }

      return [...currentRoles, roleName];
    });
  }

  function toggleEditRole(roleName: string) {
    setEditForm((currentForm) => {
      if (currentForm.roles.includes(roleName)) {
        const nextRoles = currentForm.roles.filter((role) => role !== roleName);
        return { ...currentForm, roles: nextRoles.length ? nextRoles : ['VIEWER'] };
      }

      return { ...currentForm, roles: [...currentForm.roles, roleName] };
    });
  }

  function selectUser(user: User) {
    setSelectedUser(user);
    setEditForm(fromUser(user));
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Usuarios cadastrados</h2>
              <p className="text-sm text-slate-500">{users.length} usuarios ativos ou inativos</p>
            </div>
          </div>
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={loadUsers}
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
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-md bg-white" />
            ))}
          </div>
        ) : users.length ? (
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Papeis</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`cursor-pointer border-b border-border last:border-b-0 hover:bg-slate-50 ${
                        selectedUser?.id === user.id ? 'bg-slate-50' : ''
                      }`}
                      onClick={() => selectUser(user)}
                    >
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-slate-600">
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Editar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-slate-300 bg-white px-6 text-center">
            <div>
              <Users className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold">Nenhum usuario encontrado</h2>
              <p className="mt-2 text-sm text-slate-500">Usuarios criados aparecem nesta tabela.</p>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <section className="rounded-md border border-border bg-white p-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Novo usuario</h2>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleCreateUser}>
          <Field
            label="Nome"
            value={form.name}
            onChange={(value) => setForm((currentForm) => ({ ...currentForm, name: value }))}
            required
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm((currentForm) => ({ ...currentForm, email: value }))}
            required
          />
          <Field
            label="Senha"
            type="password"
            value={form.password}
            onChange={(value) => setForm((currentForm) => ({ ...currentForm, password: value }))}
            required
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Papeis</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const selected = selectedRoles.includes(role.name);

                return (
                  <button
                    key={role.id}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-border bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    type="button"
                    onClick={() => toggleRole(role.name)}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isCreating}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {isCreating ? 'Criando...' : 'Criar usuario'}
          </button>
          </form>
        </section>

        <section className="rounded-md border border-border bg-white p-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Editar usuario</h2>
          </div>
          {selectedUser ? (
            <form className="mt-4 space-y-4" onSubmit={handleUpdateUser}>
              <Field
                label="Nome"
                value={editForm.name}
                onChange={(name) => setEditForm((currentForm) => ({ ...currentForm, name }))}
                required
              />
              <Field
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(email) => setEditForm((currentForm) => ({ ...currentForm, email }))}
                required
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(event) =>
                    setEditForm((currentForm) => ({
                      ...currentForm,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Usuario ativo
              </label>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Papeis</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const selected = editForm.roles.includes(role.name);

                    return (
                      <button
                        key={role.id}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-border bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        type="button"
                        onClick={() => toggleEditRole(role.name)}
                      >
                        {role.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isUpdating}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {isUpdating ? 'Salvando...' : 'Salvar usuario'}
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              Selecione um usuario na tabela para editar dados, status e papeis.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = `user-${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}

function fromUser(user: User) {
  return {
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    roles: user.roles.length ? user.roles : ['VIEWER'],
  };
}
