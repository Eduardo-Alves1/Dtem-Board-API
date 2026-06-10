'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/components/auth/auth-gate';
import { ProjectDetailView } from '@/components/projects/project-detail-view';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();

  return (
    <AuthGate>
      {(session) => (
        <AppShell
          user={session.user}
          title="Detalhe do projeto"
          description="Membros, tipos de work item e hierarquia configurada."
        >
          <ProjectDetailView projectId={params.id} />
        </AppShell>
      )}
    </AuthGate>
  );
}
