'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { getStoredSession, isAdmin, type AuthSession } from '@/lib/auth';

type AuthGateProps = {
  children: (session: AuthSession) => ReactNode;
  requireAdmin?: boolean;
};

export function AuthGate({ children, requireAdmin = false }: AuthGateProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession) {
      router.replace('/login');
      return;
    }

    setSession(storedSession);
    setIsReady(true);
  }, [router]);

  if (!isReady || !session) {
    return (
      <main className="min-h-screen bg-muted px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-14 w-64 animate-pulse rounded-md bg-white" />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="h-36 animate-pulse rounded-md bg-white" />
            <div className="h-36 animate-pulse rounded-md bg-white" />
            <div className="h-36 animate-pulse rounded-md bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (requireAdmin && !isAdmin(session.user)) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted px-6">
        <section className="w-full max-w-md rounded-md border border-border bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Acesso restrito</p>
          <h1 className="mt-2 text-xl font-semibold">Permissao administrativa necessaria</h1>
          <button
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            type="button"
            onClick={() => router.replace('/projects')}
          >
            Voltar para projetos
          </button>
        </section>
      </main>
    );
  }

  return children(session);
}
