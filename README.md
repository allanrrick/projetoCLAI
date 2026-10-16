# projetoCLAI
Projeto com finalidade acadêmica para a Coordenação Local de Acessibilidade e Inclusão do IFSPB Campus Cajazeiras

## Estrutura

- `apps/backend`: API em Java / Spring Boot.
- `apps/frontend`: interface em React + TypeScript.

## Executar o frontend com dados fictícios

```bash
cd apps/frontend
npm ci
npm run dev:demo
```

Acesse http://127.0.0.1:5173. A demonstração funciona sem backend e mantém os dados somente em memória. Para uso com a API, configuração, contratos e dependências ainda pendentes, consulte [o README do frontend](apps/frontend/README.md).

O fluxo de branches e commits está descrito em [CONTRIBUTING.md](CONTRIBUTING.md).
