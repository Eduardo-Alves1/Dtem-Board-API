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

## Primeiro Administrador

Depois que o PostgreSQL estiver ativo e as migrations forem aplicadas, crie o primeiro administrador:

```bash
curl -X POST http://localhost:3001/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Administrador\",\"email\":\"admin@dtem.local\",\"password\":\"change-me-admin-password\"}"
```

Esse endpoint so permite criar administrador enquanto ainda nao existir usuario com perfil `ADMIN`.

## Autenticacao

Endpoints iniciais:

- `POST /api/auth/bootstrap-admin`: cria o primeiro administrador.
- `POST /api/auth/login`: autentica usuario ativo.
- `POST /api/auth/refresh`: rotaciona refresh token.
- `POST /api/auth/logout`: revoga refresh token.
- `GET /api/users/me`: retorna claims do usuario autenticado.
- `GET /api/users`: lista usuarios, exige perfil `ADMIN`.
- `POST /api/users`: cria usuario, exige perfil `ADMIN`.
- `PATCH /api/users/:id`: edita usuario, exige perfil `ADMIN`.
- `PATCH /api/users/:id/roles`: substitui perfis do usuario, exige perfil `ADMIN`.
- `DELETE /api/users/:id`: arquiva usuario e revoga refresh tokens, exige perfil `ADMIN`.

Perfis iniciais:

- `ADMIN`
- `PRODUCT_OWNER`
- `SCRUM_MASTER`
- `DEVELOPER`
- `QA`
- `STAKEHOLDER`
- `VIEWER`

## Validacoes

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
