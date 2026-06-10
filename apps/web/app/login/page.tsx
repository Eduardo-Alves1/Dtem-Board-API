'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { getStoredSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredSession()) {
      router.replace('/projects');
    }
  }, [router]);

  return (
    <main className="grid min-h-screen bg-muted lg:grid-cols-[1fr_460px]">
      <section className="hidden border-r border-border bg-white px-10 py-8 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-semibold text-white">
            DB
          </div>
          <div>
            <p className="text-sm font-semibold">DTEM Board</p>
            <p className="text-xs text-slate-500">Gestao agil e documentacao</p>
          </div>
        </div>

        <div className="mt-auto max-w-2xl pb-8">
          <p className="text-sm font-medium text-accent">Sprint 4</p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight">
            Area autenticada para acompanhar projetos, usuarios e configuracoes do backlog.
          </h1>
          <div className="mt-8 grid max-w-xl gap-3">
            {['Projetos autorizados', 'Membros por projeto', 'Tipos e hierarquia'].map((item) => (
              <div key={item} className="rounded-md border border-border px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-semibold text-white">
              DB
            </div>
            <h1 className="mt-4 text-2xl font-semibold">DTEM Board</h1>
          </div>
          <div className="rounded-md border border-border bg-white p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Entrar</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Acesse com uma conta cadastrada na API.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
