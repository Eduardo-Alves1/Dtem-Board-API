# PRD - DTEM Board

## 1. Visao Geral

O DTEM Board e uma plataforma de gerenciamento de projetos inspirada em ferramentas como Azure DevOps e Jira, voltada para equipes de desenvolvimento de software que utilizam metodologias ageis, especialmente Scrum.

O sistema deve centralizar em uma unica plataforma o planejamento de produtos, gestao de requisitos, controle de desenvolvimento, gestao de testes, documentacao tecnica, acompanhamento de entregas e colaboracao entre equipes multidisciplinares.

## 2. Objetivos do Produto

- Centralizar a gestao completa do ciclo de desenvolvimento de software.
- Permitir a organizacao de projetos, backlog, sprints, tarefas, bugs e melhorias.
- Oferecer um Board Kanban configuravel por projeto.
- Disponibilizar um modulo de documentacao tecnica e funcional chamado Notebook.
- Apoiar equipes de Desenvolvimento, QA, Produto, Dados, Infraestrutura e Stakeholders.
- Fornecer dashboards e metricas para acompanhamento da execucao.
- Permitir configuracao de fluxos, tipos de itens e perfis de acesso.
- Preparar a arquitetura para integracoes futuras com ferramentas externas.

## 3. Publico-Alvo

- Product Owners
- Scrum Masters
- Desenvolvedores
- Analistas de QA
- Times de Produto
- Times de Dados
- Times de Infraestrutura
- Stakeholders
- Gestores e liderancas tecnicas
- Administradores da plataforma

## 4. Escopo do Produto

### 4.1 Dentro do Escopo

- Gestao de multiplos projetos.
- Configuracao de hierarquia de backlog por projeto.
- Cadastro e manutencao de tipos de work items.
- Criacao, edicao, consulta e exclusao de work items.
- Board Kanban com drag and drop.
- Fluxos personalizados de status por projeto.
- Gestao de sprints Scrum.
- Dashboards com metricas operacionais.
- Modulo Notebook para documentacao em arvore.
- Editor com suporte a Markdown, HTML, texto rico, imagens, tabelas, links, blocos de codigo e Mermaid.
- Controle de acesso por perfis.
- Historico de alteracoes, comentarios e anexos.

### 4.2 Fora do Escopo Inicial

- Integracoes ativas com GitHub, GitLab, Azure DevOps, Jenkins, SonarQube, Slack e Microsoft Teams.
- Aplicativos mobile nativos.
- Automacoes complexas de workflow.
- Inteligencia artificial para sugestao de tarefas, estimativas ou documentacao.
- Marketplace de plugins.

## 5. Personas

### 5.1 Administrador

Responsavel por configurar projetos, usuarios, perfis, tipos de itens, fluxos de trabalho e permissoes.

### 5.2 Product Owner

Responsavel por organizar backlog, priorizar entregas, detalhar requisitos, validar criterios de aceite e acompanhar progresso.

### 5.3 Scrum Master

Responsavel por planejar sprints, acompanhar impedimentos, analisar metricas ageis e apoiar a execucao do time.

### 5.4 Desenvolvedor

Responsavel por executar tasks, registrar progresso, comentar impedimentos, anexar evidencias tecnicas e atualizar status.

### 5.5 QA

Responsavel por validar entregas, registrar bugs, acompanhar testes, mover itens para UAT ou Done e documentar evidencias.

### 5.6 Stakeholder ou Visualizador

Responsavel por acompanhar andamento, consultar dashboards, acessar documentacao e validar entregas quando necessario.

## 6. Requisitos Funcionais

### RF01 - Gestao de Projetos

O sistema deve permitir o cadastro, edicao, consulta, arquivamento e exclusao logica de projetos.

Cada projeto deve possuir:

- Nome
- Descricao
- Identificador unico
- Status
- Responsaveis
- Membros
- Configuracao de backlog
- Configuracao de workflow
- Configuracao de tipos de work items
- Datas de criacao e atualizacao

Critérios de aceite:

- [ ] O administrador consegue criar um projeto.
- [ ] O administrador consegue editar dados basicos de um projeto.
- [ ] O administrador consegue arquivar um projeto sem apagar historico.
- [ ] O usuario autorizado consegue listar projetos aos quais possui acesso.
- [ ] O sistema impede acesso a projetos sem permissao.

### RF02 - Hierarquia de Backlog Configuravel

O sistema deve permitir que cada projeto configure sua propria estrutura hierarquica de backlog.

Hierarquia padrao sugerida:

```text
Projeto
  Epic
    Feature
      User Story
        Task
        Bug
```

Exemplos de configuracao por projeto:

```text
Projeto A
  Epic
    Feature
      User Story
```

```text
Projeto B
  Feature
    Task
```

```text
Projeto C
  Task
```

Critérios de aceite:

- [ ] O administrador consegue definir quais niveis de backlog serao usados por projeto.
- [ ] O sistema valida se um item pode ser filho de outro conforme a configuracao do projeto.
- [ ] O backlog exibe a arvore hierarquica corretamente.
- [ ] O usuario consegue expandir e recolher niveis da hierarquia.
- [ ] Alteracoes na configuracao nao quebram itens ja existentes.

### RF03 - Tipos de Work Items

O sistema deve possuir tipos de itens de trabalho configuraveis.

Tipos padrao:

- Epic
- Feature
- User Story
- Task
- Bug
- Improvement
- Spike

Cada tipo deve possuir:

- Nome
- Descricao
- Cor ou identificador visual
- Icone ou sigla
- Campos obrigatorios
- Permissao de uso por projeto
- Status ativo ou inativo

Critérios de aceite:

- [ ] O administrador consegue cadastrar novos tipos de itens.
- [ ] O administrador consegue ativar ou inativar tipos existentes.
- [ ] O administrador consegue definir tipos disponiveis por projeto.
- [ ] O sistema usa os tipos configurados ao criar work items.
- [ ] O sistema impede exclusao fisica de tipos ja utilizados historicamente.

### RF04 - Cadastro de Work Items

Todos os itens de trabalho devem possuir:

- Titulo
- Descricao
- Criterios de aceite
- Anexos
- Comentarios
- Historico de alteracoes
- Responsavel
- Prioridade
- Estimativa
- Sprint
- Tags
- Tipo
- Status
- Projeto
- Item pai, quando aplicavel
- Data de criacao
- Data de atualizacao

A descricao e os criterios de aceite devem utilizar o mesmo editor disponivel no Notebook.

Critérios de aceite:

- [ ] O usuario autorizado consegue criar work items.
- [ ] O usuario autorizado consegue editar work items.
- [ ] O usuario autorizado consegue vincular item pai conforme hierarquia permitida.
- [ ] O usuario autorizado consegue adicionar comentarios.
- [ ] O usuario autorizado consegue adicionar anexos.
- [ ] O sistema registra historico de alteracoes relevantes.
- [ ] O sistema permite filtrar work items por status, tipo, responsavel, sprint, prioridade e tags.

### RF05 - Notebook

O sistema deve possuir um modulo de documentacao chamado Notebook.

O Notebook deve armazenar documentacao funcional, tecnica e operacional dos projetos.

A documentacao deve ser organizada em arvore.

Exemplo:

```text
Sistema de Gestao
  Contexto Geral
    Usuarios
    Perfis
    Autenticacao
  Regras de Negocio
  Requisitos Funcionais
  Requisitos Nao Funcionais
  Arquitetura
```

Critérios de aceite:

- [ ] O usuario autorizado consegue criar paginas de documentacao.
- [ ] O usuario autorizado consegue criar subpaginas em estrutura de arvore.
- [ ] O usuario autorizado consegue mover paginas na arvore.
- [ ] O usuario autorizado consegue editar conteudo de paginas.
- [ ] O usuario autorizado consegue excluir ou arquivar paginas.
- [ ] O sistema mantem historico basico de alteracoes da documentacao.

### RF06 - Editor de Conteudo

O editor deve suportar:

- Markdown
- HTML
- Texto rico
- Imagens
- Tabelas
- Links
- Blocos de codigo
- Diagramas Mermaid
- Preview em tempo real

O usuario deve conseguir:

- Inserir imagens manualmente.
- Arrastar imagens para o editor.
- Colar imagens diretamente do clipboard.
- Inserir tabelas.
- Inserir links.
- Inserir blocos de codigo.
- Inserir diagramas Mermaid.
- Visualizar preview em tempo real.

Critérios de aceite:

- [ ] O editor renderiza Markdown corretamente.
- [ ] O editor renderiza HTML permitido com seguranca.
- [ ] O editor permite formatacao de texto rico.
- [ ] O usuario consegue inserir, arrastar e colar imagens.
- [ ] O usuario consegue inserir tabelas e links.
- [ ] O usuario consegue inserir blocos de codigo.
- [ ] O usuario consegue inserir diagramas Mermaid.
- [ ] O preview e atualizado em tempo real.

### RF07 - Board Kanban

O sistema deve possuir um quadro visual para gerenciamento das atividades.

Colunas padrao sugeridas:

- Em Analise
- Em Desenvolvimento
- Pronto para Testes
- Em Testes
- Em UAT
- Done

Os cartoes devem exibir, no minimo:

- Identificador
- Titulo
- Tipo
- Responsavel
- Prioridade
- Tags
- Sprint
- Indicador de anexos ou comentarios

Critérios de aceite:

- [ ] O usuario autorizado consegue visualizar o board de um projeto.
- [ ] O usuario autorizado consegue filtrar cartoes.
- [ ] O usuario autorizado consegue mover cartoes entre colunas.
- [ ] O sistema atualiza o status do item ao mover o cartao.
- [ ] O sistema registra a movimentacao no historico.
- [ ] O sistema atualiza metricas relacionadas ao movimento.

### RF08 - Drag and Drop e Movimentacao

Os cartoes do Board Kanban devem permitir drag and drop entre colunas permitidas pelo fluxo do projeto.

Ao mover um cartao, o sistema deve:

- Alterar status.
- Registrar historico.
- Atualizar metricas.
- Validar permissoes.
- Aplicar regras de transicao.
- Atualizar responsavel automaticamente quando configurado.

Critérios de aceite:

- [ ] O usuario consegue arrastar cartoes entre colunas permitidas.
- [ ] O sistema bloqueia transicoes nao permitidas.
- [ ] O sistema registra quem moveu, quando moveu e de qual status para qual status.
- [ ] O sistema atualiza responsavel automaticamente quando houver regra configurada.
- [ ] O sistema mantem consistencia entre Board e detalhe do work item.

### RF09 - Fluxos Personalizados

Cada projeto deve poder criar seu proprio fluxo de trabalho.

Exemplo Projeto A:

```text
Backlog
Analise
Desenvolvimento
Teste
Done
```

Exemplo Projeto B:

```text
To Do
Doing
Review
Homologacao
Producao
```

Cada status deve possuir:

- Nome
- Ordem
- Cor
- Tipo de etapa
- Transicoes permitidas
- Indicador de status final
- Regras opcionais de responsavel

Critérios de aceite:

- [ ] O administrador consegue criar status por projeto.
- [ ] O administrador consegue ordenar status.
- [ ] O administrador consegue configurar transicoes permitidas.
- [ ] O board reflete os status configurados.
- [ ] O sistema identifica corretamente status finais.

### RF10 - Sprint Scrum

O sistema deve permitir a gestao de sprints.

Funcionalidades esperadas:

- Criacao de sprints.
- Planejamento de sprint.
- Sprint backlog.
- Inicio de sprint.
- Encerramento de sprint.
- Associacao de work items a sprint.
- Burndown Chart.
- Velocity Chart.

Cada sprint deve possuir:

- Nome
- Objetivo
- Data de inicio
- Data de fim
- Status
- Projeto
- Itens associados
- Capacidade planejada
- Pontos planejados
- Pontos concluidos

Critérios de aceite:

- [ ] O usuario autorizado consegue criar uma sprint.
- [ ] O usuario autorizado consegue planejar uma sprint adicionando work items.
- [ ] O usuario autorizado consegue iniciar uma sprint.
- [ ] O usuario autorizado consegue encerrar uma sprint.
- [ ] O sistema calcula pontos planejados e concluidos.
- [ ] O sistema gera Burndown Chart.
- [ ] O sistema gera Velocity Chart.

### RF11 - Dashboard

O sistema deve possuir dashboards com indicadores do projeto e da equipe.

Indicadores iniciais:

- Tasks por status.
- Bugs por sprint.
- Bugs por responsavel.
- Velocidade da equipe.
- Lead Time.
- Cycle Time.
- Work In Progress (WIP).
- Percentual concluido.

Critérios de aceite:

- [ ] O usuario autorizado consegue visualizar dashboard do projeto.
- [ ] O dashboard exibe tasks por status.
- [ ] O dashboard exibe bugs por sprint.
- [ ] O dashboard exibe bugs por responsavel.
- [ ] O dashboard exibe velocidade da equipe.
- [ ] O dashboard exibe lead time e cycle time.
- [ ] O dashboard exibe WIP.
- [ ] O dashboard exibe percentual concluido.
- [ ] O dashboard respeita permissoes do usuario.

### RF12 - Controle de Acesso

O sistema deve possuir controle de acesso por perfis.

Perfis iniciais:

- Administrador
- Product Owner
- Scrum Master
- Desenvolvedor
- QA
- Stakeholder
- Visualizador

O controle de acesso deve considerar:

- Permissoes globais.
- Permissoes por projeto.
- Permissoes por modulo.
- Permissoes de leitura, criacao, edicao, exclusao e configuracao.

Critérios de aceite:

- [ ] O administrador consegue criar usuarios.
- [ ] O administrador consegue atribuir perfis.
- [ ] O administrador consegue vincular usuarios a projetos.
- [ ] O sistema bloqueia acoes sem permissao.
- [ ] O sistema permite acesso somente aos projetos autorizados.
- [ ] O sistema diferencia permissao de leitura e escrita.

### RF13 - Comentarios, Anexos e Historico

O sistema deve permitir colaboracao e rastreabilidade nos work items.

Funcionalidades:

- Comentarios por item.
- Mencoes a usuarios, quando aplicavel.
- Upload de anexos.
- Historico de alteracoes.
- Registro de mudanca de status.
- Registro de mudanca de responsavel, sprint, prioridade e estimativa.

Critérios de aceite:

- [ ] O usuario autorizado consegue comentar em work items.
- [ ] O usuario autorizado consegue anexar arquivos.
- [ ] O sistema registra alteracoes relevantes automaticamente.
- [ ] O historico exibe usuario, data, campo alterado, valor anterior e novo valor.
- [ ] O sistema respeita permissoes de visualizacao de anexos e comentarios.

## 7. Requisitos Nao Funcionais

### RNF01 - Seguranca

- O sistema deve autenticar usuarios antes de permitir acesso.
- O sistema deve autorizar acoes conforme perfil e projeto.
- O sistema deve proteger uploads contra arquivos maliciosos.
- O sistema deve sanitizar HTML renderizado no editor.
- O sistema deve evitar exposicao indevida de dados entre projetos.

Critérios de aceite:

- [ ] Rotas protegidas exigem autenticacao.
- [ ] Permissoes sao validadas no backend.
- [ ] Conteudo HTML e sanitizado antes de renderizar.
- [ ] Uploads passam por validacao de tipo e tamanho.

### RNF02 - Performance

- Listagens devem responder em tempo adequado mesmo com alto volume de itens.
- Consultas devem possuir paginacao, filtros e ordenacao.
- Dashboards devem usar consultas otimizadas ou agregacoes.
- O board deve carregar de forma incremental quando houver muitos cartoes.

Critérios de aceite:

- [ ] Listagens possuem paginacao.
- [ ] Filtros principais sao indexaveis no banco de dados.
- [ ] Board suporta grande volume sem travar a interface.
- [ ] Dashboards usam consultas otimizadas.

### RNF03 - Usabilidade

- A interface deve ser clara, responsiva e orientada a produtividade.
- Fluxos comuns devem exigir poucos cliques.
- O Board Kanban deve oferecer feedback visual durante drag and drop.
- Formularios devem indicar campos obrigatorios e erros de validacao.

Critérios de aceite:

- [ ] Interface responsiva em desktop e tablet.
- [ ] Formularios exibem erros de validacao.
- [ ] Acoes principais sao acessiveis a partir das telas principais.
- [ ] Drag and drop possui feedback visual.

### RNF04 - Auditoria e Rastreabilidade

- Alteracoes relevantes devem ser registradas.
- O historico deve permitir entender quem alterou, quando alterou e o que foi alterado.
- Exclusoes devem ser logicas sempre que envolverem dados historicos.

Critérios de aceite:

- [ ] Alteracoes de work items sao auditadas.
- [ ] Movimentacoes de board sao auditadas.
- [ ] Arquivamentos preservam historico.
- [ ] Historico pode ser consultado por usuarios autorizados.

### RNF05 - Escalabilidade e Manutencao

- O sistema deve ser modular.
- O dominio deve separar projetos, backlog, sprints, notebook, dashboard e acesso.
- A arquitetura deve permitir integracoes futuras.
- Regras de workflow devem ser configuraveis, evitando hardcode por projeto.

Critérios de aceite:

- [ ] Modulos principais possuem responsabilidades separadas.
- [ ] Regras de status e tipos de itens sao configuraveis.
- [ ] Integracoes futuras podem ser adicionadas sem reescrever o dominio central.

## 8. Modelo Conceitual de Dados

Entidades principais:

- Usuario
- Perfil
- Projeto
- MembroProjeto
- TipoWorkItem
- WorkItem
- WorkItemRelacionamento
- StatusWorkflow
- TransicaoWorkflow
- Sprint
- Comentario
- Anexo
- HistoricoAlteracao
- NotebookPagina
- DashboardMetrica

Relacionamentos esperados:

- Um projeto possui muitos work items.
- Um projeto possui muitos membros.
- Um projeto possui muitos status de workflow.
- Um projeto possui muitos tipos de work items habilitados.
- Um work item pertence a um projeto.
- Um work item pode possuir um item pai.
- Um work item pode estar associado a uma sprint.
- Uma sprint pertence a um projeto.
- Uma pagina de Notebook pertence a um projeto.
- Uma pagina de Notebook pode possuir pagina pai.

## 9. Epicos do Produto

- [x] EP01 - Fundacao tecnica e arquitetura base.
- [x] EP02 - Autenticacao, usuarios e controle de acesso.
- [ ] EP03 - Gestao de projetos.
- [ ] EP04 - Configuracao de tipos de work items.
- [ ] EP05 - Hierarquia de backlog.
- [ ] EP06 - Cadastro e manutencao de work items.
- [ ] EP07 - Board Kanban e drag and drop.
- [ ] EP08 - Workflows personalizados.
- [ ] EP09 - Gestao de sprints Scrum.
- [ ] EP10 - Notebook e editor de conteudo.
- [ ] EP11 - Dashboards e metricas.
- [ ] EP12 - Auditoria, comentarios e anexos.
- [ ] EP13 - Preparacao para integracoes futuras.

## 10. Stack Tecnica Recomendada

### 10.1 Backend

- Linguagem: TypeScript.
- Runtime: Node.js LTS 24.
- Framework: NestJS.
- ORM: Prisma.
- Banco principal: PostgreSQL.
- Cache e filas: Redis.
- Processamento assincrono: BullMQ.
- Autenticacao: JWT com Refresh Token, com preparacao para SSO/OAuth no futuro.
- Documentacao da API: Swagger/OpenAPI.
- Validacao: class-validator, class-transformer e pipes do NestJS.
- Upload de arquivos: modulo de upload do NestJS com armazenamento externo.

### 10.2 Frontend

- Framework: Next.js.
- Biblioteca de UI: React.
- Linguagem: TypeScript.
- Estilizacao: Tailwind CSS.
- Componentes: shadcn/ui.
- Estado de servidor: TanStack Query.
- Estado local: Zustand.
- Drag and drop: dnd-kit.
- Editor de conteudo: TipTap.
- Diagramas: Mermaid.
- Graficos e dashboards: Recharts ou Apache ECharts.

### 10.3 Banco de Dados e Armazenamento

- Banco relacional: PostgreSQL.
- Cache: Redis.
- Armazenamento de anexos e imagens: S3 compatible storage, como AWS S3, MinIO ou Azure Blob Storage.
- Estrategia de exclusao: exclusao logica para dados historicos.
- Identificadores: UUID, preferencialmente UUIDv7 quando suportado pela versao do banco.

### 10.4 Infraestrutura e DevOps

- Containerizacao: Docker.
- Ambiente local: Docker Compose.
- CI/CD: GitHub Actions ou Azure DevOps Pipelines.
- Qualidade: ESLint, Prettier, testes automatizados e checagens de build.
- Observabilidade futura: logs estruturados, metricas e tracing.
- Deploy: ambiente cloud ou on-premise conteinerizado.

### 10.5 Decisao Arquitetural Inicial

O produto deve iniciar como um monolito modular, separando claramente os modulos de autenticacao, usuarios, projetos, backlog, work items, workflows, sprints, notebook, dashboards, anexos e auditoria.

Microservicos nao devem ser adotados na primeira versao, pois aumentariam a complexidade operacional sem necessidade imediata. A arquitetura deve, porem, manter baixo acoplamento entre modulos para permitir extracoes futuras caso algum dominio exija escala independente.

### 10.6 Justificativa da Stack

- NestJS oferece uma estrutura adequada para APIs modulares, com suporte a guards, pipes, interceptors, validacao, testes, uploads, filas e integracoes.
- PostgreSQL e adequado para o dominio do DTEM Board por causa dos relacionamentos fortes entre projetos, usuarios, permissoes, work items, sprints, status, transicoes e historico.
- Prisma acelera o desenvolvimento, melhora a produtividade com TypeScript e facilita migrations.
- Next.js com React permite criar uma interface rica para Kanban, dashboards, editores e fluxos administrativos.
- Redis e BullMQ suportam processamento assincrono, cache, notificacoes futuras e calculos de metricas.
- S3 compatible storage evita armazenar anexos diretamente no banco e permite escalar armazenamento.

## 11. Roadmap de Desenvolvimento por Sprints

### Sprint 0 - Preparacao e Fundacao

Objetivo: definir base tecnica, padroes, arquitetura inicial e ambiente de desenvolvimento.

Atividades:

- [x] Definir Node.js LTS 24 como runtime do backend.
- [x] Definir NestJS e TypeScript como base da API.
- [x] Definir Next.js, React e TypeScript como base do frontend.
- [x] Definir PostgreSQL como banco de dados principal.
- [x] Definir Prisma como ORM e ferramenta de migrations.
- [x] Definir Redis e BullMQ para cache, filas e processamento assincrono.
- [x] Definir Tailwind CSS e shadcn/ui como base visual do frontend.
- [x] Definir dnd-kit para drag and drop do Board Kanban.
- [x] Definir TipTap como editor do Notebook e das descricoes de work items.
- [x] Definir Mermaid para diagramas.
- [x] Definir Recharts como biblioteca inicial para dashboards.
- [x] Definir S3 compatible storage para anexos e imagens.
- [x] Criar estrutura inicial do repositorio.
- [x] Configurar padroes de branch, commits e pull requests.
- [x] Configurar ambiente local.
- [x] Configurar variaveis de ambiente.
- [x] Criar pipeline inicial de build e testes.
- [x] Definir JWT com Refresh Token como padrao inicial de autenticacao.
- [x] Definir arquitetura modular.

Entregaveis:

- [x] Projeto base executando localmente.
- [x] Documentacao inicial de setup.
- [x] Pipeline minimo configurado.

### Sprint 1 - Autenticacao e Usuarios

Objetivo: implementar base de usuarios, login e controle inicial de acesso.

Atividades:

- [x] Criar modelo de Usuario.
- [x] Criar modelo de Perfil.
- [x] Implementar login.
- [x] Implementar logout.
- [x] Implementar validacao de sessao ou token.
- [x] Criar middleware ou guard de autenticacao.
- [x] Criar cadastro administrativo de usuarios.
- [x] Criar atribuicao de perfis.
- [x] Criar validacao basica de permissoes no backend.

Entregaveis:

- [x] Usuarios conseguem autenticar.
- [x] Rotas protegidas bloqueiam acesso anonimo.
- [x] Administrador consegue gerenciar usuarios e perfis.

### Sprint 2 - Gestao de Projetos

Objetivo: permitir criacao e administracao de projetos.

Atividades:

- [ ] Criar modelo de Projeto.
- [ ] Criar modelo de MembroProjeto.
- [ ] Implementar CRUD de projetos.
- [ ] Implementar arquivamento de projetos.
- [ ] Implementar vinculo de usuarios a projetos.
- [ ] Implementar permissoes por projeto.
- [ ] Criar listagem de projetos por usuario.
- [ ] Criar tela de detalhe do projeto.

Entregaveis:

- [ ] Administrador consegue criar e configurar projetos.
- [ ] Usuarios visualizam somente projetos autorizados.
- [ ] Projetos podem ser arquivados sem perda de historico.

### Sprint 3 - Tipos de Work Items e Hierarquia

Objetivo: configurar tipos de work items e estrutura de backlog por projeto.

Atividades:

- [ ] Criar modelo de TipoWorkItem.
- [ ] Criar cadastro de tipos padrao.
- [ ] Implementar CRUD de tipos de work items.
- [ ] Implementar ativacao e inativacao de tipos.
- [ ] Implementar configuracao de tipos permitidos por projeto.
- [ ] Criar configuracao de hierarquia de backlog.
- [ ] Implementar validacao de relacionamento pai e filho.
- [ ] Criar visualizacao inicial da arvore de backlog.

Entregaveis:

- [ ] Administrador configura tipos por projeto.
- [ ] Administrador configura hierarquia por projeto.
- [ ] Sistema valida corretamente relacionamentos entre itens.

### Sprint 4 - Work Items

Objetivo: implementar cadastro, edicao e consulta de work items.

Atividades:

- [ ] Criar modelo de WorkItem.
- [ ] Implementar criacao de work items.
- [ ] Implementar edicao de work items.
- [ ] Implementar consulta detalhada de work items.
- [ ] Implementar exclusao logica ou arquivamento.
- [ ] Implementar campos de titulo, descricao e criterios de aceite.
- [ ] Implementar responsavel, prioridade, estimativa, sprint e tags.
- [ ] Implementar filtros por tipo, status, responsavel, prioridade e tags.
- [ ] Implementar listagem paginada.

Entregaveis:

- [ ] Usuario autorizado consegue criar e editar work items.
- [ ] Work items respeitam configuracao de tipo e hierarquia.
- [ ] Listagens e filtros principais estao disponiveis.

### Sprint 5 - Comentarios, Anexos e Historico

Objetivo: adicionar colaboracao e rastreabilidade aos work items.

Atividades:

- [ ] Criar modelo de Comentario.
- [ ] Criar modelo de Anexo.
- [ ] Criar modelo de HistoricoAlteracao.
- [ ] Implementar comentarios em work items.
- [ ] Implementar upload de anexos.
- [ ] Implementar validacao de tamanho e tipo de arquivo.
- [ ] Registrar alteracoes relevantes no historico.
- [ ] Exibir historico no detalhe do item.
- [ ] Registrar mudancas de status, responsavel, sprint, prioridade e estimativa.

Entregaveis:

- [ ] Work items possuem comentarios.
- [ ] Work items possuem anexos.
- [ ] Historico de alteracoes e exibido ao usuario autorizado.

### Sprint 6 - Workflow Personalizado

Objetivo: permitir que cada projeto configure seus proprios status e transicoes.

Atividades:

- [ ] Criar modelo de StatusWorkflow.
- [ ] Criar modelo de TransicaoWorkflow.
- [ ] Implementar CRUD de status por projeto.
- [ ] Implementar ordenacao de status.
- [ ] Implementar cores e identificadores visuais.
- [ ] Implementar transicoes permitidas.
- [ ] Implementar regra de status final.
- [ ] Implementar validacao de transicao no backend.

Entregaveis:

- [ ] Projetos possuem workflows configuraveis.
- [ ] Transicoes invalidas sao bloqueadas.
- [ ] Status finais sao identificados corretamente.

### Sprint 7 - Board Kanban

Objetivo: entregar o quadro visual de acompanhamento das atividades.

Atividades:

- [ ] Criar visualizacao do Board Kanban.
- [ ] Renderizar colunas conforme workflow do projeto.
- [ ] Renderizar cartoes de work items.
- [ ] Implementar filtros no board.
- [ ] Implementar drag and drop.
- [ ] Atualizar status ao mover cartao.
- [ ] Registrar historico de movimentacao.
- [ ] Atualizar metricas basicas do board.
- [ ] Validar permissao e transicao antes de mover cartao.

Entregaveis:

- [ ] Usuario visualiza board do projeto.
- [ ] Usuario move cartoes entre colunas permitidas.
- [ ] Historico e metricas sao atualizados apos movimentacao.

### Sprint 8 - Sprints Scrum

Objetivo: implementar planejamento, execucao e encerramento de sprints.

Atividades:

- [ ] Criar modelo de Sprint.
- [ ] Implementar CRUD de sprints.
- [ ] Implementar status de sprint.
- [ ] Implementar planejamento de sprint.
- [ ] Permitir associar work items a sprint.
- [ ] Implementar inicio de sprint.
- [ ] Implementar encerramento de sprint.
- [ ] Calcular pontos planejados.
- [ ] Calcular pontos concluidos.
- [ ] Criar Sprint Backlog.

Entregaveis:

- [ ] Usuario autorizado cria e planeja sprints.
- [ ] Work items podem ser associados a sprints.
- [ ] Sprints podem ser iniciadas e encerradas.

### Sprint 9 - Notebook e Editor

Objetivo: implementar modulo de documentacao e editor de conteudo.

Atividades:

- [ ] Criar modelo de NotebookPagina.
- [ ] Implementar arvore de paginas por projeto.
- [ ] Implementar criacao de paginas.
- [ ] Implementar criacao de subpaginas.
- [ ] Implementar edicao de paginas.
- [ ] Implementar movimentacao de paginas na arvore.
- [ ] Implementar arquivamento ou exclusao logica.
- [ ] Integrar editor com Markdown.
- [ ] Integrar suporte a HTML sanitizado.
- [ ] Integrar texto rico.
- [ ] Implementar upload, arrastar e colar imagens.
- [ ] Implementar tabelas, links e blocos de codigo.
- [ ] Implementar diagramas Mermaid.
- [ ] Implementar preview em tempo real.

Entregaveis:

- [ ] Notebook permite documentacao em arvore.
- [ ] Editor atende aos recursos definidos.
- [ ] Preview em tempo real funciona.

### Sprint 10 - Dashboards e Metricas

Objetivo: entregar dashboards com indicadores operacionais e ageis.

Atividades:

- [ ] Definir consultas e agregacoes de metricas.
- [ ] Implementar tasks por status.
- [ ] Implementar bugs por sprint.
- [ ] Implementar bugs por responsavel.
- [ ] Implementar velocidade da equipe.
- [ ] Implementar lead time.
- [ ] Implementar cycle time.
- [ ] Implementar WIP.
- [ ] Implementar percentual concluido.
- [ ] Criar visualizacao dos graficos.
- [ ] Implementar Burndown Chart.
- [ ] Implementar Velocity Chart.

Entregaveis:

- [ ] Dashboard do projeto disponivel.
- [ ] Indicadores principais calculados corretamente.
- [ ] Graficos de sprint disponiveis.

### Sprint 11 - Hardening, QA e Preparacao para Release

Objetivo: estabilizar o produto para primeira entrega utilizavel.

Atividades:

- [ ] Revisar permissoes de todos os modulos.
- [ ] Criar testes automatizados dos fluxos principais.
- [ ] Executar testes manuais de regressao.
- [ ] Corrigir bugs criticos.
- [ ] Revisar performance de listagens e dashboards.
- [ ] Revisar seguranca de editor, uploads e autorizacao.
- [ ] Revisar experiencia de uso em telas principais.
- [ ] Atualizar documentacao tecnica.
- [ ] Preparar guia de uso inicial.
- [ ] Preparar checklist de release.

Entregaveis:

- [ ] Produto pronto para primeira release interna.
- [ ] Fluxos principais testados.
- [ ] Documentacao minima disponivel.

### Sprint 12 - Integracoes Futuras - Preparacao Arquitetural

Objetivo: preparar pontos de extensao para integracoes externas sem implementar conectores completos.

Integracoes futuras previstas:

- GitHub
- GitLab
- Azure DevOps
- Jenkins
- SonarQube
- Slack
- Microsoft Teams

Atividades:

- [ ] Definir contratos internos para integracoes.
- [ ] Criar camada de abstracao para provedores externos.
- [ ] Criar modelo conceitual de configuracao de integracoes.
- [ ] Mapear eventos internos que poderao disparar integracoes.
- [ ] Documentar estrategia de integracao futura.

Entregaveis:

- [ ] Arquitetura preparada para integracoes futuras.
- [ ] Contratos e eventos documentados.

## 12. Criterios de Aceite Gerais do Produto

- [ ] O sistema permite gerenciar multiplos projetos.
- [ ] O sistema permite configurar backlog por projeto.
- [ ] O sistema permite configurar tipos de work items.
- [ ] O sistema permite criar e manter work items.
- [ ] O sistema permite usar Board Kanban configuravel.
- [ ] O sistema permite criar e gerenciar sprints.
- [ ] O sistema permite documentar projetos no Notebook.
- [ ] O sistema oferece editor com recursos avancados.
- [ ] O sistema oferece dashboards com indicadores.
- [ ] O sistema possui controle de acesso por perfil e projeto.
- [ ] O sistema registra historico de alteracoes relevantes.
- [ ] O sistema respeita requisitos minimos de seguranca, performance e usabilidade.

## 13. Riscos e Pontos de Atencao

- [ ] Complexidade de configurar workflows flexiveis sem tornar o uso dificil.
- [ ] Performance do Board Kanban com grande volume de cartoes.
- [ ] Seguranca no suporte a HTML e upload de imagens.
- [ ] Precisao das metricas de lead time, cycle time e velocidade.
- [ ] Usabilidade da configuracao de hierarquia por projeto.
- [ ] Controle de acesso consistente em todos os modulos.
- [ ] Manutencao de historico sem crescimento descontrolado do banco.

## 14. Dependencias

- [x] Definicao da stack tecnica.
- [x] Definicao do banco de dados.
- [x] Definicao do padrao de autenticacao.
- [x] Definicao das regras de permissao.
- [x] Definicao do editor de conteudo.
- [x] Definicao da biblioteca de drag and drop.
- [x] Definicao da biblioteca de graficos.
- [x] Definicao da estrategia de armazenamento de anexos.

## 15. Indicadores de Sucesso

- [ ] Times conseguem planejar e executar sprints dentro da plataforma.
- [ ] Backlog e work items sao usados como fonte principal de acompanhamento.
- [ ] Documentacao do projeto passa a ser mantida no Notebook.
- [ ] Stakeholders conseguem acompanhar progresso por dashboards.
- [ ] Reducao de controles paralelos em planilhas ou documentos soltos.
- [ ] Aumento da rastreabilidade entre requisito, tarefa, teste, bug e entrega.

## 16. Definition of Done do Produto

Uma funcionalidade sera considerada concluida quando:

- [ ] Requisitos funcionais implementados.
- [ ] Criterios de aceite atendidos.
- [ ] Validacoes de permissao implementadas no backend.
- [ ] Tratamento de erros implementado.
- [ ] Testes automatizados relevantes criados ou atualizados.
- [ ] Teste manual executado no fluxo principal.
- [ ] Historico ou auditoria implementado quando aplicavel.
- [ ] Documentacao tecnica ou funcional atualizada quando aplicavel.
- [ ] Funcionalidade revisada e aprovada.
