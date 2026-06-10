'use client';

import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/components/auth/auth-gate';
import { ProjectsView } from '@/components/projects/projects-view';

export default function ProjectsPage() {
  return (
    <AuthGate>
      {(session) => (
        <AppShell
          user={session.user}
          title="Projetos"
          description="Backlogs e configuracoes acessiveis ao usuario autenticado."
        >
          <ProjectsView user={session.user} />
        </AppShell>
      )}
    </AuthGate>
  );
}
