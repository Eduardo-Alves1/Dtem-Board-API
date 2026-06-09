# Arquitetura Inicial

O DTEM Board inicia como um monolito modular em monorepo.

## Modulos planejados

- Auth
- Usuarios
- Projetos
- Membros de projeto
- Tipos de work items
- Backlog
- Work items
- Workflows
- Sprints
- Notebook
- Anexos
- Auditoria
- Dashboards

## Decisao inicial

Microservicos nao serao usados na primeira versao. A complexidade inicial do produto esta no dominio, nas permissoes e nos workflows configuraveis, nao em escala independente por servico.

A API NestJS deve manter modulos bem separados para permitir extracao futura de dominios, caso alguma area passe a exigir escala, deploy ou propriedade independente.

## Comunicacao

- Frontend Next.js consome a API NestJS via HTTP.
- API NestJS acessa PostgreSQL via Prisma.
- Jobs assincronos futuros serao processados com BullMQ e Redis.
- Anexos e imagens serao armazenados em S3 compatible storage.

## Ambientes

- Local: Docker Compose para PostgreSQL, Redis e MinIO.
- CI: GitHub Actions com install, Prisma generate, typecheck, lint, test e build.
- Deploy futuro: containers em ambiente cloud ou on-premise.
