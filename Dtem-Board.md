
# DTEM Board
Visão Geral

O DTEM Board é uma plataforma de gerenciamento de projetos inspirada em ferramentas como Azure DevOps e Jira, voltada para equipes de desenvolvimento de software que utilizam metodologias ágeis, especialmente Scrum.

# O sistema deverá permitir o gerenciamento completo do ciclo de desenvolvimento de software, incluindo:

Gestão de projetos;
Gestão de backlog;
Planejamento e execução de sprints;
Controle de tarefas;
Gestão de documentação técnica;
Fluxos personalizados de trabalho;
Acompanhamento de equipes multidisciplinares (Desenvolvimento, QA, Produto, Dados, Infraestrutura, etc.).
Objetivos

# O sistema tem como objetivo centralizar em uma única plataforma:

Planejamento de produtos;
Gestão de requisitos;
Controle de desenvolvimento;
Gestão de testes;
Documentação técnica;
Acompanhamento de entregas.
Gestão de Projetos

# O sistema deverá permitir o cadastro de múltiplos projetos.

Cada projeto poderá possuir sua própria estrutura hierárquica de backlog.

Exemplo de estrutura:

Projeto
 └── Epic
      └── Feature
            └── User Story
                  ├── Task
                  └── Bug

# A utilização dessa hierarquia deverá ser configurável por projeto.

Exemplos:

Projeto A
Epic
 └── Feature
      └── User Story
	  
Projeto B
Feature
 └── Task
 
Projeto C
Task

Tipos de Itens de Trabalho

# O sistema deverá possuir os seguintes tipos de itens:

- Epic
- Feature
- User Story
- Task
- Bug
- Improvement
- Spike
Os tipos deverão ser configuráveis por administrador.
----

Notebook (Wiki)

# O sistema deverá possuir um módulo de documentação chamado Notebook.

Seu objetivo será armazenar documentação funcional, técnica e operacional dos projetos.
Estrutura Hierárquica

# A documentação deverá ser organizada em árvore.

Exemplo:

Sistema de Gestão
│
├── Contexto Geral
│   ├── Usuários
│   ├── Perfis
│   └── Autenticação
│
├── Regras de Negócio
│
├── Requisitos Funcionais
│
├── Requisitos Não Funcionais
│
└── Arquitetura

# Editor de Conteúdo

# O Notebook deverá suportar:

- Markdown
- HTML
- Texto Rico (Rich Text)
- Recursos do Editor

# Deverá ser possível:

- Inserir imagens;
- Arrastar imagens;
- Colar imagens diretamente do clipboard;
- Inserir tabelas;
- Inserir links;
- Inserir blocos de código;
- Inserir diagramas Mermaid;
- Visualizar preview em tempo real.

Exemplo:

┌──────────────┬──────────────┐
│ Editor       │ Preview      │
├──────────────┼──────────────┤
│ Markdown     │ Resultado    │
│ HTML         │ Renderizado  │
└──────────────┴──────────────┘
Descrição dos Work Items

# Todos os itens de trabalho deverão possuir:

- Título;
- Descrição;
- Critérios de Aceite;
- Anexos;
- Comentários;
- Histórico de Alterações;
- Responsável;
- Prioridade;
- Estimativa;
- Sprint;
- Tags.

# A descrição deverá utilizar o mesmo editor disponível no Notebook.

Board Kanban

# O sistema deverá possuir um quadro visual para gerenciamento das atividades.

| Em Análise |
|------------|
| TASK-001   |
| TASK-002   |

| Em Desenvolvimento |
|--------------------|
| TASK-003           |

| Pronto para Testes |
|--------------------|
| TASK-004           |

| Em Testes |
|-----------|
| TASK-005  |

| Em UAT |
|---------|
| TASK-006|

| Done |
|------|
| TASK-007 |

Movimentação

# Os cartões deverão permitir:

Drag and Drop;
Mudança de status;
Atualização automática dos responsáveis;
Registro no histórico;
Atualização de métricas.
Fluxos Personalizados

# Cada projeto poderá criar seus próprios status.

Exemplo:

Projeto A

Backlog
Análise
Desenvolvimento
Teste
Done

Projeto B

To Do
Doing
Review
Homologação
Produção

Sprint Scrum

# O sistema deverá permitir:

Criação de Sprints;
Planejamento de Sprint;
Sprint Backlog;
Encerramento de Sprint;
Burndown Chart;
Velocity Chart.

Dashboard

# O sistema deverá possuir dashboards com indicadores como:

Tasks por Status;
Bugs por Sprint;
Bugs por Responsável;
Velocidade da Equipe;
Lead Time;
Cycle Time;
Work In Progress (WIP);
Percentual Concluído.
Controle de Acesso

# O sistema deverá possuir perfis de acesso.

Exemplos:

Administrador
Product Owner
Scrum Master
Desenvolvedor
QA
Stakeholder
Visualizador
Integrações Futuras
GitHub
GitLab
Azure DevOps
Jenkins
SonarQube
Slack
Microsoft Teams