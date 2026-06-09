import { Activity, BookOpen, Columns3, Gauge } from 'lucide-react';
import type { HealthResponse } from '@dtem-board/shared';

const modules = [
  {
    title: 'Projetos e Backlog',
    description: 'Organize epics, features, stories, tasks, bugs e melhorias por projeto.',
    icon: Activity,
  },
  {
    title: 'Board Kanban',
    description: 'Acompanhe fluxo, responsaveis e status com colunas configuraveis.',
    icon: Columns3,
  },
  {
    title: 'Notebook',
    description: 'Centralize documentacao tecnica, funcional e operacional em arvore.',
    icon: BookOpen,
  },
  {
    title: 'Dashboards',
    description: 'Monitore WIP, bugs, velocidade, lead time, cycle time e progresso.',
    icon: Gauge,
  },
];

const apiStatus: HealthResponse = {
  status: 'ok',
  service: 'dtem-board-web',
  timestamp: new Date().toISOString(),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="text-sm font-medium text-accent">Sprint 0</p>
            <h1 className="text-2xl font-semibold">DTEM Board</h1>
          </div>
          <div className="rounded-md border border-border px-3 py-2 text-sm">
            API base: {apiStatus.status}
          </div>
        </header>

        <div className="grid flex-1 content-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight">
              Fundacao tecnica para gestao agil de projetos e documentacao.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Base monorepo com API NestJS, frontend Next.js, pacote compartilhado, PostgreSQL,
              Redis, MinIO, Prisma e pipeline inicial.
            </p>
          </div>

          <div className="grid gap-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <article key={module.title} className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{module.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
