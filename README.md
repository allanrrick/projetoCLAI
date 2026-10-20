# Projeto CLAI

Sistema web desenvolvido com finalidade acadêmica para a **Coordenação Local de Acessibilidade e Inclusão (CLAI)** do **IFPB — Campus Cajazeiras**.

## Sobre

O sistema apoia os profissionais da CLAI no acompanhamento pedagógico e institucional de estudantes atendidos pela coordenação. A plataforma centraliza:

- **Gestão de Alunos**: cadastro e consulta de perfis de estudantes (matrícula, nome completo, curso, e-mail e situação cadastral), prevenindo registros duplicados.
- **Registro de Atendimentos**: documentação estruturada de cada atendimento realizado com data, horário, profissional responsável, observações detalhadas e upload de documentos comprobatórios ou orientações (PDF, PNG, JPEG).
- **Histórico Cronológico**: visualização da linha do tempo de atendimentos por estudante, com busca textual (observações, profissional e anexos), filtro por período e ordenação cronológica.
- **Controle de Acesso e Permissões**: autenticação por sessão, cadastro de usuários com proteção criptográfica de credenciais e controle de acesso baseado em perfis (`PROFISSIONAL_CLAI` com acesso completo e `ASSISTENTE` com acesso restrito à consulta de alunos).

## Stack Utilizada

### Backend (`apps/backend`)
- **Java**: 21
- **Spring Boot**: 4.1.1 (`spring-boot-starter-webmvc`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-jdbc`)
- **Hibernate ORM**: 7.4.5.Final
- **Banco de Dados**: PostgreSQL (driver `org.postgresql:postgresql`)
- **Lombok**: 1.18.x
- **Gerenciador de Build**: Apache Maven (`mvnw` incluso)

### Frontend (`apps/frontend`)
- **React**: 19.2.8
- **React DOM**: 19.2.8
- **React Router DOM**: 7.18.4
- **TypeScript**: ~6.0.2
- **Vite**: 8.3.0
- **Lucide React**: 1.57.0 (ícones)
- **Qualidade e Testes**: Oxlint 1.81.0, Prettier 3.9.10 e Playwright 1.64.1 (testes E2E)

## Guia de Instalação e Execução

### Pré-requisitos
- **Java JDK 21+**
- **Node.js 20.19+ ou 22.12+** e **npm**
- **Git**
- Instância **PostgreSQL** acessível (configurada em `apps/backend/src/main/resources/application.properties`)

### Passo a passo

1. **Clonar o repositório e acessar a pasta do projeto:**
   ```bash
   git clone https://github.com/allanrrick/projetoCLAI.git
   cd projetoCLAI
   ```

2. **Executar o Backend (API Spring Boot na porta `8080`):**
   ```bash
   cd apps/backend
   ./mvnw spring-boot:run
   ```
   *(No Windows PowerShell/CMD, utilize `.\mvnw.cmd spring-boot:run`)*

3. **Executar o Frontend (React + Vite na porta `5173`) em outro terminal:**
   ```bash
   cd apps/frontend
   cp .env.example .env
   npm ci
   npm run dev
   ```

4. **Acessar a aplicação no navegador:**
   - Abra `http://127.0.0.1:5173`.
   - Você pode criar uma nova conta clicando em **"Criar conta"** na tela inicial ou entrar com a conta padrão inicializada automaticamente:
     - **Profissional CLAI (acesso completo):** `coordenacao@clai.ifpb.edu.br` / senha: `clai123456`
     - **Consulta (acesso restrito):** `consulta@clai.ifpb.edu.br` / senha: `clai123456`

### Modo de Demonstração (sem backend)
Caso deseje avaliar apenas a interface com dados fictícios em memória:
```bash
cd apps/frontend
npm ci
npm run dev:demo
```

## Fluxo de Contribuição

O fluxo de branches (Git Flow) e o padrão de commits estão descritos em [CONTRIBUTING.md](CONTRIBUTING.md).

## Equipe

Pedro Rennan, Allan Rick, Jhean Lucas, Rhamede Maciel, Nicolas Emídio
