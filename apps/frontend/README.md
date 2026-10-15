# Frontend CLAI

Interface em React + TypeScript + Vite para o acompanhamento de alunos da CLAI do IFPB Campus Cajazeiras. Código em `apps/frontend`, separado do Spring Boot em `apps/backend`.

## Executar

Requer Node.js 20.19+ ou 22.12+ e npm.

```bash
cd apps/frontend
npm ci
npm run dev:demo
```

Abra http://127.0.0.1:5173. A demonstração usa somente dados fictícios em memória, permite cadastrar alunos e atendimentos e restaura os exemplos ao recarregar a página. Não insira dados reais nesse modo. Não há persistência no navegador nem envio à API.

Para conectar ao backend:

```bash
cp .env.example .env
npm run dev
```

O modo normal **não ativa demonstração quando a API falha**. O backend precisa fornecer a sessão e as permissões antes de liberar as telas. Na versão atual do repositório, os endpoints de autenticação e atendimento ainda não existem; alinhe os contratos propostos abaixo antes da integração real. O backend da branch `development` contém apenas a estrutura inicial; os endpoints de alunos estão na branch `feat/consulta-aluno`.

## Telas e tarefas do quadro

| Issue                                                      | Tela/comportamento implementado                                                                                                       | Dependência de integração                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [#8](https://github.com/allanrrick/projetoCLAI/issues/8)   | Cadastro com matrícula, nome, e-mail opcional e curso; validação; envio; tratamento de duplicidade, sucesso e erro                    | Endpoints de alunos existentes em `feat/consulta-aluno`, sessão e acesso pelo backend |
| [#14](https://github.com/allanrrick/projetoCLAI/issues/14) | Atendimento associado ao aluno, data, hora, observações e documentos opcionais                                                        | Contrato de atendimento proposto, ainda não implementado no servidor                  |
| [#18](https://github.com/allanrrick/projetoCLAI/issues/18) | Histórico por aluno, ordenação por data/hora e estados vazios                                                                         | Endpoint de histórico proposto                                                        |
| [#19](https://github.com/allanrrick/projetoCLAI/issues/19) | Busca sem distinção de acentos/maiúsculas em observações, profissional e nomes dos anexos; período inclusivo e validação de intervalo | Confirmação desses filtros com a equipe; filtros locais sobre o histórico retornado   |
| [#24](https://github.com/allanrrick/projetoCLAI/issues/24) | Menus, ações e rotas condicionados às permissões; tratamento de 401/403; limpeza da tela ao expirar a sessão                          | Servidor autenticado com autorização efetiva em todas as operações                    |

O frontend não implementa autenticação ou autorização no servidor e não conclui essas issues de backend. As tarefas do GitHub não foram alteradas. O formulário de login é a interface para o contrato proposto de autenticação. Cadastro de usuários e anexos no perfil do aluno dependem de definição e implementação da API e não estão incluídos nesta entrega.

## Organização

```text
src/
  components/common.tsx  Componentes de mensagens, títulos e estados
  hooks/useResource.ts   Carregamento assíncrono com proteção contra respostas antigas
  lib/api.ts            Chamadas HTTP, sessão, CSRF e tratamento de erros
  lib/demo.ts           Simulador explícito com dados fictícios em memória
  lib/format.ts         Datas, busca e validação de URLs de anexos
  pages/                Alunos, cadastro, atendimento e histórico
  App.tsx               Navegação, sessão e controle visual de permissões
  types.ts              Tipos dos contratos
```

## Contratos da API

Todas as chamadas partem de `VITE_API_BASE_URL` (padrão `/api`), usam cookies via `credentials: include`, esperam JSON e têm timeout de 15 segundos. Respostas HTML ou redirecionamentos para login são tratados como erro. As rotas abaixo são relativas ao backend.

Em desenvolvimento, o Vite remove `/api` e encaminha ao `API_TARGET` (padrão `http://localhost:8080`). Nenhum segredo deve ser colocado em variáveis `VITE_`, pois elas são públicas no bundle.

### Alunos — contrato existente

Verificado no `AlunoController`, `Aluno` e `CadastrarAlunoDTO` da branch `feat/consulta-aluno`.

- `GET /alunos`: retorna `Aluno[]`.
- `POST /alunos`: recebe JSON com `matricula` (obrigatória, até 20 caracteres), `nome` (obrigatório, até 150), `email` (opcional, até 150) e `curso` (obrigatório, até 100).
- E-mail vazio é enviado como `null`. Nome, matrícula, e-mail e curso têm espaços externos removidos.
- O sucesso do POST é confirmado pela resposta 2xx do servidor; 409 informa matrícula/e-mail duplicados. A lista é consultada novamente após salvar.

```json
{
  "idAluno": 1,
  "matricula": "202600001",
  "nome": "Nome do aluno",
  "email": null,
  "curso": "Nome do curso",
  "ativo": true,
  "dataCadastro": "2026-10-15"
}
```

### Sessão — proposta para alinhar com o backend

- `GET /auth/sessao`: sessão autenticada, ou 401 quando não autenticado. Se esse recurso estiver ausente ou indisponível, as telas permanecem fechadas.
- `POST /auth/login`: JSON `{ "email": "...", "senha": "..." }`; estabelece cookie de sessão e retorna JSON ou 204. O cliente consulta a sessão em seguida.
- `POST /auth/logout`: invalida a sessão no servidor, retornando JSON ou 204. Uma falha é exibida sem afirmar que a sessão foi encerrada.

Resposta esperada de `GET /auth/sessao`:

```json
{
  "nome": "Profissional CLAI",
  "email": "profissional@example.com",
  "permissoes": [
    "alunos:consultar",
    "alunos:cadastrar",
    "atendimentos:consultar",
    "atendimentos:cadastrar"
  ],
  "csrfToken": "token-fornecido-pelo-servidor",
  "csrfHeaderName": "X-CSRF-TOKEN"
}
```

Os campos de CSRF são opcionais no formato da sessão e devem acompanhar a política efetiva do servidor. O cliente envia o token da sessão em operações de escrita. O fluxo de login também precisa da configuração de CSRF acordada com o backend. A configuração padrão do Spring Security (form login) não implementa esse contrato de login JSON. Não desabilite segurança para contornar essa dependência.

As permissões vêm da sessão, não de escolhas na interface. Ocultar botões e bloquear rotas no React não substitui autorização no servidor. O backend deve validar todas as operações, inclusive download de documentos e o aluno consultado. A navegação de atendimento e histórico também exige `alunos:consultar` para selecionar o aluno.

### Atendimentos — proposta para alinhar com o backend

- `GET /alunos/{idAluno}/atendimentos`: retorna `Atendimento[]` exclusivamente do aluno autorizado.
- `POST /atendimentos`: recebe `multipart/form-data` com uma parte `atendimento` (`application/json`) e partes `documentos` (arquivos). O profissional deve ser obtido da sessão no servidor.

Parte `atendimento`:

```json
{
  "idAluno": 1,
  "data": "2026-10-15",
  "hora": "09:30",
  "observacoes": "Descrição do atendimento"
}
```

Resposta de consulta/criação:

```json
{
  "idAtendimento": 1,
  "idAluno": 1,
  "data": "2026-10-15",
  "hora": "09:30:00",
  "observacoes": "Descrição do atendimento",
  "profissional": "Nome do profissional",
  "documentos": [
    { "id": "1", "nome": "orientacoes.pdf", "url": "/api/documentos/1" }
  ]
}
```

Os nomes de campo e endpoints desse módulo são uma proposta, centralizada em `src/lib/api.ts`; não foram encontrados no backend. Ajuste o adaptador e os tipos se a equipe definir outro formato. A interface limita a seleção a 5 arquivos PDF/PNG/JPEG de até 10 MB cada e observações a 10 mil caracteres; alinhar esses limites com o backend. Tipo, conteúdo, tamanho e autorização dos anexos também precisam ser validados pelo servidor.

A interface só abre URLs de anexos HTTP/HTTPS na mesma origem ou blobs da demonstração. A API deve devolver URLs de download da mesma origem, com autorização no servidor. Não são exibidos links `javascript:` nem URLs externas não verificadas.

## Validação

```bash
npm run build
npm run lint
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Os testes de navegador cobrem os fluxos de demonstração e requisições HTTP interceptadas para verificar contratos e respostas de erro. **Não são testes de integração com um backend real.** A suíte usa as portas 5173 e 5174; mantenha-as livres para garantir o modo correto de cada servidor. Em uma máquina com Chrome instalado é possível definir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/caminho/do/chrome`.

## Publicação

`npm run build` gera `dist/`. Configure o servidor para servir `index.html` nas rotas do frontend e encaminhar `/api/*` ao backend, removendo o prefixo se a API mantiver `/alunos`. O proxy do Vite só existe em desenvolvimento. Use a mesma origem para frontend e API ou configure conscientemente cookies, CORS e CSRF no servidor. Não publique a versão de demonstração como sistema de produção.

Referências: [React com Vite](https://react.dev/learn/build-a-react-app-from-scratch), [Vite](https://vite.dev/guide/).
