'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/components/auth/auth-gate';
import { UsersView } from '@/components/users/users-view';

export default function UsersPage() {
  return (
    <AuthGate requireAdmin>
      {(session) => (
        <AppShell
          user={session.user}
          title="Usuarios"
          description="Cadastro inicial e papeis de acesso."
        >
          <UsersView />
        </AppShell>
      )}
    </AuthGate>
  );
}
