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

Antes de iniciar, certifique-se de que você possui o Docker instalado e em execução na sua máquina.

Em seguida, abra o projeto na IDE de sua preferência, navegue para apps -> backend e configure as variáveis de ambiente no .env.

Então, abra um novo terminal e execute os seguintes comandos

```bash
cd apps/backend
docker compose up -d
```

Espere as aplicações inicializarem e abra em seu navegador https://localhost:5173

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
