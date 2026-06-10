# Rotas da API - DTEM Board

Este arquivo deve ser atualizado sempre que novas rotas forem adicionadas, alteradas ou removidas.

## Informacoes Gerais

Base local da API:

```text
http://localhost:3001/api
```

Documentacao Swagger:

```text
http://localhost:3001/docs
```

Base local do frontend:

```text
http://localhost:3000
```

Formato padrao:

```http
Content-Type: application/json
```

Rotas protegidas exigem token JWT no header:

```http
Authorization: Bearer <accessToken>
```

Perfis iniciais:

- `ADMIN`
- `PRODUCT_OWNER`
- `SCRUM_MASTER`
- `DEVELOPER`
- `QA`
- `STAKEHOLDER`
- `VIEWER`

## Frontend

### GET /

Redireciona o usuario para `/projects` quando existe sessao local ou para `/login` quando nao existe sessao.

### GET /login

Tela de autenticacao do sistema.

Consome:

- `POST /auth/login`

### GET /projects

Tela autenticada com listagem de projetos visiveis para o usuario.

Consome:

- `GET /projects`
- `POST /projects`, quando o usuario possui perfil `ADMIN`

### GET /projects/:id

Tela autenticada com detalhe inicial do projeto, membros, tipos de work item habilitados e hierarquia do backlog.

Consome:

- `GET /projects/:id`
- `GET /projects/:projectId/work-item-types`
- `GET /projects/:projectId/backlog-hierarchy`

### GET /users

Tela administrativa de usuarios e papeis.

Consome:

- `GET /users`
- `GET /users/roles`
- `POST /users`

## Health

### GET /health

Verifica se a API esta online.

Autenticacao: publica.

Exemplo:

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "dtem-board-api",
  "timestamp": "2026-06-10T12:00:00.000Z"
}
```

## Auth

### POST /auth/bootstrap-admin

Cria o primeiro usuario administrador quando ainda nao existe usuario com perfil `ADMIN`.

Autenticacao: publica.

Body:

```json
{
  "name": "Administrador",
  "email": "admin@dtem.local",
  "password": "change-me-admin-password"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Administrador\",\"email\":\"admin@dtem.local\",\"password\":\"change-me-admin-password\"}"
```

Resposta esperada:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@dtem.local",
    "name": "Administrador",
    "roles": ["ADMIN"]
  },
  "tokens": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

Erros comuns:

- `409 Conflict`: ja existe usuario administrador.

### POST /auth/login

Autentica um usuario ativo.

Autenticacao: publica.

Body:

```json
{
  "email": "admin@dtem.local",
  "password": "change-me-admin-password"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@dtem.local\",\"password\":\"change-me-admin-password\"}"
```

Resposta esperada:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@dtem.local",
    "name": "Administrador",
    "roles": ["ADMIN"]
  },
  "tokens": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

Erros comuns:

- `401 Unauthorized`: credenciais invalidas ou usuario inativo.

### POST /auth/refresh

Rotaciona um refresh token valido e retorna um novo par de tokens.

Autenticacao: publica.

Body:

```json
{
  "refreshToken": "<refreshToken>"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"<refreshToken>\"}"
```

Resposta esperada:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@dtem.local",
    "name": "Administrador",
    "roles": ["ADMIN"]
  },
  "tokens": {
    "accessToken": "novo-jwt",
    "refreshToken": "novo-jwt"
  }
}
```

Erros comuns:

- `401 Unauthorized`: refresh token invalido, expirado ou revogado.

### POST /auth/logout

Revoga um refresh token.

Autenticacao: obrigatoria.

Body:

```json
{
  "refreshToken": "<refreshToken>"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"refreshToken\":\"<refreshToken>\"}"
```

Resposta esperada:

```json
{
  "success": true
}
```

Erros comuns:

- `401 Unauthorized`: access token ausente, invalido ou expirado.
- `404 Not Found`: refresh token nao encontrado.

## Users

### GET /users/me

Retorna os dados do usuario autenticado presentes no token.

Autenticacao: obrigatoria.

Exemplo:

```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "email": "admin@dtem.local",
  "name": "Administrador",
  "roles": ["ADMIN"]
}
```

### GET /users/roles

Lista os perfis disponiveis.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl http://localhost:3001/api/users/roles \
  -H "Authorization: Bearer <accessToken>"
```

Resposta esperada:

```json
[
  {
    "id": "uuid",
    "name": "ADMIN",
    "description": null
  }
]
```

### GET /users

Lista usuarios ativos.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer <accessToken>"
```

Resposta esperada:

```json
[
  {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@dtem.local",
    "isActive": true,
    "roles": ["ADMIN"],
    "createdAt": "2026-06-10T12:00:00.000Z",
    "updatedAt": "2026-06-10T12:00:00.000Z"
  }
]
```

### POST /users

Cria um usuario.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "Maria Silva",
  "email": "maria@dtem.local",
  "password": "change-me-user-password",
  "roles": ["DEVELOPER"]
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"name\":\"Maria Silva\",\"email\":\"maria@dtem.local\",\"password\":\"change-me-user-password\",\"roles\":[\"DEVELOPER\"]}"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "email": "maria@dtem.local",
  "isActive": true,
  "roles": ["DEVELOPER"],
  "createdAt": "2026-06-10T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z"
}
```

Erros comuns:

- `409 Conflict`: e-mail ja esta em uso.
- `404 Not Found`: algum perfil informado nao existe.

### GET /users/:id

Busca um usuario por ID.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl http://localhost:3001/api/users/<userId> \
  -H "Authorization: Bearer <accessToken>"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "email": "maria@dtem.local",
  "isActive": true,
  "roles": ["DEVELOPER"],
  "createdAt": "2026-06-10T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z"
}
```

### PATCH /users/:id

Atualiza dados basicos de um usuario.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "Maria Souza",
  "email": "maria.souza@dtem.local",
  "isActive": true
}
```

Exemplo:

```bash
curl -X PATCH http://localhost:3001/api/users/<userId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"name\":\"Maria Souza\",\"email\":\"maria.souza@dtem.local\",\"isActive\":true}"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "name": "Maria Souza",
  "email": "maria.souza@dtem.local",
  "isActive": true,
  "roles": ["DEVELOPER"],
  "createdAt": "2026-06-10T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z"
}
```

### PATCH /users/:id/roles

Substitui os perfis de um usuario.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "roles": ["QA", "VIEWER"]
}
```

Exemplo:

```bash
curl -X PATCH http://localhost:3001/api/users/<userId>/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"roles\":[\"QA\",\"VIEWER\"]}"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "name": "Maria Souza",
  "email": "maria.souza@dtem.local",
  "isActive": true,
  "roles": ["QA", "VIEWER"],
  "createdAt": "2026-06-10T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z"
}
```

### DELETE /users/:id

Arquiva um usuario, desativa o acesso e revoga refresh tokens ativos.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl -X DELETE http://localhost:3001/api/users/<userId> \
  -H "Authorization: Bearer <accessToken>"
```

Resposta esperada:

```json
{
  "id": "uuid",
  "name": "Maria Souza",
  "email": "maria.souza@dtem.local",
  "isActive": false,
  "roles": ["QA", "VIEWER"],
  "createdAt": "2026-06-10T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z"
}
```

## Projects

### GET /projects

Lista os projetos visiveis para o usuario autenticado. Usuarios `ADMIN` veem todos os projetos ativos; outros usuarios veem somente projetos em que sao membros.

Autenticacao: obrigatoria.

Exemplo:

```bash
curl http://localhost:3001/api/projects \
  -H "Authorization: Bearer <accessToken>"
```

### POST /projects

Cria um projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "DTEM Board",
  "key": "DTEM",
  "description": "Plataforma de gestao agil de projetos.",
  "memberIds": ["uuid"]
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"name\":\"DTEM Board\",\"key\":\"DTEM\",\"description\":\"Plataforma de gestao agil de projetos.\"}"
```

### GET /projects/:id

Busca um projeto por ID.

Autenticacao: obrigatoria.

Permissao: `ADMIN` ou membro do projeto.

Exemplo:

```bash
curl http://localhost:3001/api/projects/<projectId> \
  -H "Authorization: Bearer <accessToken>"
```

### PATCH /projects/:id

Atualiza dados basicos do projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "DTEM Board API",
  "key": "DTEM",
  "description": "API da plataforma DTEM Board."
}
```

Exemplo:

```bash
curl -X PATCH http://localhost:3001/api/projects/<projectId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"name\":\"DTEM Board API\",\"description\":\"API da plataforma DTEM Board.\"}"
```

### DELETE /projects/:id

Arquiva um projeto sem remover historico.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl -X DELETE http://localhost:3001/api/projects/<projectId> \
  -H "Authorization: Bearer <accessToken>"
```

### POST /projects/:id/members

Adiciona ou atualiza um membro do projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "userId": "uuid",
  "role": "MEMBER"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/projects/<projectId>/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"userId\":\"<userId>\",\"role\":\"MEMBER\"}"
```

### PATCH /projects/:id/members/:userId

Atualiza o papel de um membro no projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "role": "OWNER"
}
```

Exemplo:

```bash
curl -X PATCH http://localhost:3001/api/projects/<projectId>/members/<userId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"role\":\"OWNER\"}"
```

### DELETE /projects/:id/members/:userId

Remove um membro do projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl -X DELETE http://localhost:3001/api/projects/<projectId>/members/<userId> \
  -H "Authorization: Bearer <accessToken>"
```

## Work Item Types

### GET /work-item-types

Lista os tipos globais de work items. Na primeira chamada, o sistema garante os tipos padrao: `Epic`, `Feature`, `User Story`, `Task`, `Bug`, `Improvement` e `Spike`.

Autenticacao: obrigatoria.

Exemplo:

```bash
curl http://localhost:3001/api/work-item-types \
  -H "Authorization: Bearer <accessToken>"
```

### POST /work-item-types

Cria um tipo global de work item.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "Risk",
  "description": "Risco identificado no projeto.",
  "color": "#9333EA",
  "icon": "RK"
}
```

Exemplo:

```bash
curl -X POST http://localhost:3001/api/work-item-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"name\":\"Risk\",\"description\":\"Risco identificado no projeto.\",\"color\":\"#9333EA\",\"icon\":\"RK\"}"
```

### PATCH /work-item-types/:id

Atualiza um tipo global de work item.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "name": "Risk",
  "description": "Risco do projeto.",
  "color": "#9333EA",
  "icon": "RK",
  "isActive": true
}
```

Exemplo:

```bash
curl -X PATCH http://localhost:3001/api/work-item-types/<typeId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"description\":\"Risco do projeto.\",\"isActive\":true}"
```

### DELETE /work-item-types/:id

Inativa um tipo global de work item sem apagar historico.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Exemplo:

```bash
curl -X DELETE http://localhost:3001/api/work-item-types/<typeId> \
  -H "Authorization: Bearer <accessToken>"
```

### GET /projects/:projectId/work-item-types

Lista os tipos de work item habilitados para um projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN` ou membro do projeto.

Exemplo:

```bash
curl http://localhost:3001/api/projects/<projectId>/work-item-types \
  -H "Authorization: Bearer <accessToken>"
```

### PUT /projects/:projectId/work-item-types

Substitui a configuracao de tipos de work item habilitados para um projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "workItemTypeIds": ["uuid-epic", "uuid-feature", "uuid-task"]
}
```

Exemplo:

```bash
curl -X PUT http://localhost:3001/api/projects/<projectId>/work-item-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"workItemTypeIds\":[\"<typeId>\"]}"
```

### GET /projects/:projectId/backlog-hierarchy

Retorna a hierarquia de backlog configurada para o projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN` ou membro do projeto.

Exemplo:

```bash
curl http://localhost:3001/api/projects/<projectId>/backlog-hierarchy \
  -H "Authorization: Bearer <accessToken>"
```

### PUT /projects/:projectId/backlog-hierarchy

Substitui a hierarquia de backlog do projeto.

Autenticacao: obrigatoria.

Permissao: `ADMIN`.

Body:

```json
{
  "hierarchy": [
    {
      "childTypeId": "uuid-epic",
      "level": 0
    },
    {
      "parentTypeId": "uuid-epic",
      "childTypeId": "uuid-feature",
      "level": 1
    },
    {
      "parentTypeId": "uuid-feature",
      "childTypeId": "uuid-task",
      "level": 2
    }
  ]
}
```

Exemplo:

```bash
curl -X PUT http://localhost:3001/api/projects/<projectId>/backlog-hierarchy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d "{\"hierarchy\":[{\"childTypeId\":\"<epicTypeId>\",\"level\":0},{\"parentTypeId\":\"<epicTypeId>\",\"childTypeId\":\"<featureTypeId>\",\"level\":1}]}"
```

Erros comuns:

- `404 Not Found`: algum tipo informado nao esta habilitado para o projeto.
- `409 Conflict`: hierarquia sem raiz unica, com duplicidade ou com tipo pai igual ao tipo filho.

## Fluxo Rapido para Teste Manual

1. Subir dependencias:

```bash
docker compose up -d
```

2. Aplicar migrations:

```bash
npm run prisma:migrate
```

3. Iniciar API:

```bash
npm run start -w @dtem-board/api
```

4. Criar primeiro admin:

```bash
curl -X POST http://localhost:3001/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Administrador\",\"email\":\"admin@dtem.local\",\"password\":\"change-me-admin-password\"}"
```

5. Fazer login e usar o `accessToken` nas rotas protegidas.
