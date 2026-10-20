# Fluxo de contribuição

O projeto usa Git Flow, mantendo os nomes de branches já existentes:

- `main`: versões estáveis.
- `development`: integração do trabalho em desenvolvimento, equivalente a `develop` no Git Flow tradicional.
- `feature/<nome>`: desenvolvimento de funcionalidades, sempre a partir de `development`.
- `release/<versao>`: preparação de uma versão a partir de `development`, integrada em `main` e `development` após validação.
- `hotfix/<nome>`: correção urgente a partir de `main`, integrada em `main` e `development`.

## Desenvolver uma funcionalidade

```bash
git switch development
git pull --ff-only origin development
git switch -c feature/nome-da-funcionalidade
```

Divida o trabalho em commits por responsabilidade. Cada commit deve conter suas dependências e manter o projeto compilável. No frontend, execute `npm run build` em `apps/frontend` e os testes pertinentes às alterações.

Use mensagens no formato `tipo(escopo): descrição`:

```text
chore(frontend): configurar React, TypeScript e Vite
feat(alunos): implementar listagem e cadastro de alunos
fix(historico): corrigir filtro por período
test(frontend): cobrir fluxos de atendimento e permissões
docs(frontend): documentar execução e contratos da API
```

Quando aplicável, referencie a issue no corpo do commit com `Refs #8`. Use `Closes #8` somente quando todos os critérios da issue estiverem atendidos, inclusive a integração necessária.

Depois de validar a feature, publique sua branch e abra um pull request para `development`. Preserve a divisão dos commits na integração; um merge com `--no-ff` mantém o agrupamento da feature no histórico. A integração em `main` acontece pelo fluxo de release ou hotfix.

## Frontend atual

A branch `feature/frontend` reúne a configuração, os módulos de alunos, histórico e atendimentos, os testes e a documentação. A integração de autenticação e atendimentos depende dos contratos do backend descritos em [apps/frontend/README.md](apps/frontend/README.md). A interface e os testes com API simulada não representam a conclusão dessas dependências.

Não inclua dependências instaladas, builds, resultados de testes, segredos ou configurações pessoais do editor nos commits.
