'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { FolderKanban, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { logout } from '@/lib/api';
import { isAdmin, type AuthUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: ReactNode;
  user: AuthUser;
  title: string;
  description?: string;
};

const navigation = [
  { href: '/projects', label: 'Projetos', icon: FolderKanban, adminOnly: false },
  { href: '/users', label: 'Usuarios', icon: Users, adminOnly: true },
];

export function AppShell({ children, user, title, description }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNavigation = navigation.filter((item) => !item.adminOnly || isAdmin(user));

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <main className="min-h-screen bg-muted text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-border bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-border px-5">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-white">
                <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">DTEM Board</p>
                <p className="text-xs text-slate-500">Workspace</p>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    className={cn(
                      'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950',
                      isActive && 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white',
                    )}
                    href={item.href}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden border-t border-border p-3 lg:block">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Settings className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-slate-600"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
            <div className="min-w-0 py-3">
              <h1 className="truncate text-lg font-semibold">{title}</h1>
              {description ? (
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </header>

          <div className="px-4 py-5 md:px-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
