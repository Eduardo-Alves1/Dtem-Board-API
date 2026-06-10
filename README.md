# DTEM Board

Plataforma de gerenciamento de projetos, backlog, sprints, board Kanban, documentacao tecnica e dashboards para equipes ageis.

## Stack

- Backend: Node.js 24 LTS, NestJS, TypeScript, Prisma, PostgreSQL, Redis e BullMQ.
- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand e dnd-kit.
- Infra local: Docker Compose com PostgreSQL, Redis e MinIO.

## Estrutura

```text
apps/
  api/      API NestJS
  web/      Frontend Next.js
packages/
  shared/   Tipos e contratos compartilhados
```

## Pre-requisitos

- Node.js 24 LTS
- npm 11+
- Docker Desktop, para subir PostgreSQL, Redis e MinIO localmente

## Setup Local

```bash
npm install
copy .env.example .env
docker compose up -d
npm run prisma:generate
npm run dev
```

API: `http://localhost:3001/api`

Swagger: `http://localhost:3001/docs`

Web: `http://localhost:3000`

Frontend usa `NEXT_PUBLIC_API_URL` para chamar a API. Em ambiente local, o valor padrao e `http://localhost:3001/api`.

## Scripts

- `npm run dev`: inicia apps em modo desenvolvimento.
- `npm run build`: compila todos os workspaces.
- `npm run lint`: executa lint.
- `npm run test`: executa testes.
- `npm run typecheck`: executa checagem de tipos.
- `npm run prisma:generate`: gera o Prisma Client.
- `npm run prisma:migrate`: executa migrations locais.
