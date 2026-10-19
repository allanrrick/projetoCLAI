# Frontend CLAI

Interface em React + TypeScript + Vite para o acompanhamento de alunos da CLAI do IFPB Campus Cajazeiras. Código em `apps/frontend`, integrado ao backend Spring Boot em `apps/backend`.

## Executar

Requer Node.js 20.19+ ou 22.12+ e npm.

Para executar com o backend (`apps/backend` na porta 8080):

```bash
cd apps/frontend
cp .env.example .env
npm ci
npm run dev
```

Para executar apenas a demonstração em memória (sem backend):

```bash
cd apps/frontend
npm ci
npm run dev:demo
```

Abra http://127.0.0.1:5173. No modo normal (`npm run dev`), o frontend utiliza os endpoints reais do backend (`/auth`, `/alunos` e `/atendimentos`).

## Telas e issues atendidas

| Issue                                                      | Funcionalidade implementada e integrada                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [#8](https://github.com/allanrrick/projetoCLAI/issues/8)   | Formulário de cadastro de alunos com matrícula, nome, e-mail opcional e curso, integrado a `POST /alunos` e `GET /alunos` |
| [#14](https://github.com/allanrrick/projetoCLAI/issues/14) | Formulário de registro de atendimentos com aluno, data, hora, observações e anexo, integrado a `POST /atendimentos`       |
| [#15](https://github.com/allanrrick/projetoCLAI/issues/15) | Validação de campos obrigatórios, associação com aluno e anexos no registro de atendimentos                               |
| [#17](https://github.com/allanrrick/projetoCLAI/issues/17) | Consulta do histórico de atendimentos por aluno integrada a `GET /atendimentos/{matricula}`                               |
| [#18](https://github.com/allanrrick/projetoCLAI/issues/18) | Exibição do histórico de atendimentos em ordem cronológica e tratamento de estado vazio                                   |
| [#19](https://github.com/allanrrick/projetoCLAI/issues/19) | Busca textual (observações, profissional e anexos) e filtros por período no histórico                                     |
| [#20](https://github.com/allanrrick/projetoCLAI/issues/20) | Testes de consulta, ordenação, busca, filtros e estado vazio do histórico                                                 |
| [#21](https://github.com/allanrrick/projetoCLAI/issues/21) | Fluxo de autenticação (`POST /auth/login`, `GET /auth/sessao`, `POST /auth/logout`)                                       |
| [#22](https://github.com/allanrrick/projetoCLAI/issues/22) | Fluxo e formulário de cadastro de usuários (`POST /auth/cadastro`) com validação e perfis de acesso                       |
| [#23](https://github.com/allanrrick/projetoCLAI/issues/23) | Definição e verificação de permissões por perfil (`PROFISSIONAL_CLAI` e `ASSISTENTE`)                                     |
| [#24](https://github.com/allanrrick/projetoCLAI/issues/24) | Controle de exibição de menus, rotas e ações conforme permissões da sessão e tratamento de 401/403                        |
| [#25](https://github.com/allanrrick/projetoCLAI/issues/25) | Restrição do registro e consulta de atendimentos a usuários autorizados                                                   |
| [#26](https://github.com/allanrrick/projetoCLAI/issues/26) | Suíte de testes cobrindo autenticação, cadastro de usuários, permissões e proteção dos atendimentos                       |

## Contratos da API Integrados

Todas as chamadas partem de `VITE_API_BASE_URL` (padrão `/api`), usam cookies de sessão (`credentials: include`), enviam `X-CSRF-TOKEN` em operações de escrita e têm timeout de 15 segundos. Em desenvolvimento, o Vite encaminha `/api/*` para `API_TARGET` (padrão `http://localhost:8080`).

### Autenticação e Usuários (`/auth`)

- `POST /auth/cadastro`: recebe `{ nome, email, senha, perfil }`, cria o usuário com senha protegida por hash PBKDF2 (`PBKDF2WithHmacSHA256`), inicia a sessão e retorna `SessaoDTO` (`201 Created`).
- `POST /auth/login`: recebe `{ email, senha }`, valida credenciais e estabelece sessão (`200 OK`).
- `GET /auth/sessao`: retorna a sessão ativa com `nome`, `email`, `perfil`, `permissoes`, `csrfToken` e `csrfHeaderName` (`200 OK` ou `401 Unauthorized`).
- `POST /auth/logout`: encerra a sessão (`204 No Content`).

### Alunos (`/alunos`)

- `GET /alunos`: lista alunos cadastrados (requer `alunos:consultar`).
- `GET /alunos/{id}`: consulta aluno por ID (requer `alunos:consultar`).
- `POST /alunos`: cadastra aluno com `matricula`, `nome`, `email` e `curso` (requer `alunos:cadastrar`).

### Atendimentos (`/atendimentos`)

- `POST /atendimentos`: recebe `multipart/form-data` com `matricula`, `data`, `hora`, `observacoes` e `documento` opcional (requer `atendimentos:cadastrar`).
- `GET /atendimentos/{matricula}`: retorna o histórico do aluno como uma lista de `HistoricoAtendimentoDTO` (requer `atendimentos:consultar`).
- `GET /atendimentos/documentos/{nomeFicheiro}`: realiza o download do documento anexado (requer `atendimentos:consultar`).

#### Consulta do histórico

Todos os parâmetros de consulta são opcionais:

| Parâmetro | Formato         | Comportamento                                                                                                                                                                                                                                   |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`       | Texto           | Busca em observações, profissional e nome do anexo, sem diferenciar maiúsculas, minúsculas ou acentos. Espaços externos são removidos; texto vazio ou só com espaços é ignorado. O diretório e o prefixo UUID do anexo não participam da busca. |
| `inicio`  | `yyyy-MM-dd`    | Inclui atendimentos a partir desta data, inclusive.                                                                                                                                                                                             |
| `fim`     | `yyyy-MM-dd`    | Inclui atendimentos até esta data, inclusive.                                                                                                                                                                                                   |
| `ordem`   | `asc` ou `desc` | Ordena por data e depois por hora. O padrão é `desc` (mais recentes primeiro).                                                                                                                                                                  |

Busca, período e ordenação podem ser combinados. É possível informar somente uma das datas ou consultar um único dia com `inicio` igual a `fim`.

```http
GET /atendimentos/API001?q=orientacao&inicio=2026-10-01&fim=2026-10-31&ordem=asc
```

Resposta `200 OK`:

```json
[
  {
    "id": 42,
    "data": "2026-10-15",
    "hora": "09:30",
    "observacoes": "Orientação sobre recursos de acessibilidade.",
    "profissional": "Profissional CLAI",
    "documentoUrl": null
  }
]
```

O contrato contém somente `id`, `data`, `hora`, `observacoes`, `profissional` e `documentoUrl`. Um anexo ausente é representado por `documentoUrl: null`.

- Aluno existente sem atendimentos ou consulta sem correspondências: `200 OK` com `[]`.
- Matrícula inexistente: `404 Not Found`.
- Data inválida, período com `fim` anterior a `inicio` ou ordem diferente de `asc`/`desc`: `400 Bad Request`. O período invertido retorna a mensagem "A data final deve ser igual ou posterior à data inicial." no campo `detail` de `application/problem+json`.
- Sem sessão: `401 Unauthorized`. Sem a permissão `atendimentos:consultar`: `403 Forbidden`.

A timeline preserva a ordem recebida do servidor. A busca aguarda 300 ms após a última alteração; mudanças nos filtros refazem a consulta e cancelam a requisição anterior. O modo de demonstração aplica os mesmos filtros e ordenação em memória.

## Validação

Na primeira execução dos testes de navegador, instale o Chromium com `npx playwright install chromium`.

```bash
npm run build
npm run lint
npm run format:check
npm run test:e2e
```

Os testes de integração do histórico no backend usam o perfil `test` com H2 em memória, isolado do Supabase. Em `apps/backend`, execute `.\mvnw.cmd verify` com JDK 21 para validar o backend.
