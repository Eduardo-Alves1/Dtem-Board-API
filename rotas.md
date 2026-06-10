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

