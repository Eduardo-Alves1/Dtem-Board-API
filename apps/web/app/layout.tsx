import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DTEM Board',
  description: 'Workspace autenticado para projetos, backlog, sprints e documentacao.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
