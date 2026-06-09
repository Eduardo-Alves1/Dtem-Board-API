# Setup Local

## Pre-requisitos

- Node.js 24 LTS
- npm 11+
- Docker Desktop

## Instalar dependencias

```bash
npm install
```

## Configurar variaveis

```bash
copy .env.example .env
```

Revise os valores antes de usar em um ambiente compartilhado.

## Subir infraestrutura local

```bash
docker compose up -d
```

Servicos locais:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO Console: `localhost:9001`

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Desenvolvimento

```bash
npm run dev
```

- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/docs`
- Web: `http://localhost:3000`

## Validacoes

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
