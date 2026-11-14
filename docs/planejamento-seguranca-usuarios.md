# Planejamento de Segurança do Cadastro de Usuários

Planejamento da [issue #62](https://github.com/allanrrick/projetoCLAI/issues/62), conforme a [avaliação #52](https://github.com/allanrrick/projetoCLAI/issues/52). A restrição do cadastro e a adoção do Spring Security ficam para uma etapa posterior; a autenticação atual permanece para simulação enquanto os demais requisitos são priorizados.

## 1. Situação Atual

- O backend utiliza Spring MVC, JPA e `HttpSession`; as dependências de Spring Security estão comentadas no `pom.xml`. O login valida e-mail, senha e situação ativa por `UsuarioRepository` e `SenhaHasher`, que armazena hashes PBKDF2 no formato `salt:hash`.
- `AuthController` oferece login, consulta de sessão, logout e cadastro. `POST /auth/cadastro` é público, permite escolher o perfil e retorna `201` com `SessaoDTO`, iniciando uma sessão como o usuário criado. `SessaoDTO` contém identidade, perfil, permissões e informações de CSRF.
- `AutorizacaoInterceptor`, registrado em `WebConfig`, protege `/alunos`, `/atendimentos`, `/planos-acao` e seus subcaminhos por sessão, permissão e CSRF nas escritas (`X-CSRF-TOKEN`). `/auth/**` fica fora dessa proteção. Relatórios, PEI e PEA também não possuem proteção equivalente na API.
- No frontend, `Login` em `App.tsx` oferece **Criar conta** publicamente. O cadastro substitui a sessão em `lib/api.ts` e chama `onLogin`. Menus e `Guard` usam as permissões de `Auth.Provider`. O cliente envia cookies e CSRF, mas exclui o `401` de `/auth/cadastro` da limpeza de sessão.

| Perfil              | Permissões atuais                                                                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROFISSIONAL_CLAI` | `alunos:consultar`, `alunos:cadastrar`, `alunos:editar`, `alunos:desativar`, `atendimentos:consultar`, `atendimentos:cadastrar`, `planos:consultar`, `planos:cadastrar`. |
| `ASSISTENTE`        | Somente `alunos:consultar`.                                                                                                                                              |

Ainda não existe permissão específica para cadastrar usuários.

## 2. Regra Futura e Respostas Esperadas

Somente usuários autenticados com perfil `PROFISSIONAL_CLAI` poderão executar `POST /auth/cadastro`. Adicionar `usuarios:cadastrar` exclusivamente a esse perfil. A identidade do solicitante será obtida do servidor; o perfil enviado no corpo define apenas a conta a criar.

| Condição                                                        | Resposta futura    | Resultado                                                      |
| :-------------------------------------------------------------- | :----------------- | :------------------------------------------------------------- |
| Sem autenticação válida ou com sessão expirada, com ou sem CSRF | `401 Unauthorized` | Não consultar duplicidade nem gravar; exigir login.            |
| `ASSISTENTE` autenticado, com CSRF válido                       | `403 Forbidden`    | Não gravar e manter a sessão.                                  |
| Profissional com CSRF ausente ou inválido                       | `403 Forbidden`    | Não gravar e informar falha de segurança.                      |
| Profissional com CSRF e dados válidos                           | `201 Created`      | Retornar identificador, nome, e-mail e perfil do novo usuário. |
| Profissional autorizado com dados ou perfil inválidos           | `400 Bad Request`  | Rejeitar os dados sem gravar.                                  |
| Profissional autorizado com e-mail duplicado                    | `409 Conflict`     | Impedir duplicidade.                                           |

O cadastro não deverá autenticar o usuário criado nem substituir a identidade, sessão ou contexto de segurança do profissional. A resposta não conterá senha, hash ou credenciais de sessão. A nova conta fará seu próprio login.

## 3. Estratégia Futura para Spring Security

1. **Configuração:** habilitar os starters de segurança e testes nas versões gerenciadas pelo Spring Boot. Configurar `SecurityFilterChain` no pacote `com.projetoCLAI.auth`, mantendo Spring MVC, JPA e sessões por cookie.
2. **Identidade e senhas:** reutilizar `Usuario` e `UsuarioRepository` com `UserDetailsService` e `AuthenticationManager`. Converter `PerfilUsuario.getPermissoes()` em authorities, rejeitar contas inativas e integrar `SenhaHasher` a um `PasswordEncoder` compatível com os hashes existentes.
3. **Sessão:** manter login JSON, aplicar proteção contra fixação e persistir explicitamente o `SecurityContext` em `SecurityContextRepository`. Preservar `SessaoDTO` e os atributos `CLAI_USUARIO_*` usados por atendimentos e planos, derivados do principal autenticado. Logout limpará contexto, sessão e token; cadastro não executará login. Referência: [sessões no Spring Security](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html).
4. **Autorização:** manter públicas somente as operações necessárias ao login e à consulta de sessão (`401` para anônimos); exigir autenticação no logout e `usuarios:cadastrar` no cadastro, sem liberar `/auth/**` integralmente. Migrar as regras por caminho e método do interceptor, preservando as permissões existentes. Incluir relatórios, PEI e PEA com `atendimentos:cadastrar`, conforme suas rotas na interface; negar operações sem regra. Retirar a proteção do interceptor somente após a cobertura pela cadeia, evitando validação duplicada.
5. **CSRF e CORS:** proteger login, cadastro, logout e demais escritas com token da sessão e `X-CSRF-TOKEN`. Planejar a obtenção inicial pelo cabeçalho de `GET /auth/sessao`, mantendo `401` e corpo de erro para anônimos; essa sessão de CSRF não autentica. O cliente lerá o cabeçalho inclusive no `401`; após login, usará o token atualizado de `SessaoDTO`, renovando-o também após logout. Reutilizar as origens e credenciais de CORS, expor o cabeçalho e processar preflight antes da autorização. Referência: [CSRF no Spring Security](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html).
6. **Erros:** configurar `AuthenticationEntryPoint` e `AccessDeniedHandler` para JSON com `Erro`, sem redirecionar para HTML. Tratar também falhas do filtro CSRF: cadastro sem autenticação válida retorna `401`, mesmo sem token; usuário autenticado sem permissão ou com token inválido recebe `403`.

Backend e frontend deverão adotar a restrição e o novo contrato de cadastro juntos. Correções de infraestrutura, banco e migrações ficam fora deste planejamento.

## 4. Alterações Futuras no Frontend

- Remover o cadastro público de `Login` e oferecer o formulário em rota interna, com menu e acesso direto protegidos por `Guard` e `can('usuarios:cadastrar')`.
- Preservar validações de nome, e-mail, senha, confirmação e perfil, com estados de envio, sucesso e erro. No sucesso, manter a conta do profissional, sem chamar `onLogin`.
- Ajustar `api.cadastrarUsuario()` e os tipos para retornar os dados da nova conta, em vez de `Session`; acrescentar a permissão e alinhar o simulador ao contrato.
- Armazenar o CSRF inicial separadamente da sessão autenticada e enviá-lo antes do login. Remover a exceção de `/auth/cadastro` no tratamento de `401`, limpando a sessão e exigindo login; `403` manterá a conta e exibirá o erro.

## 5. Testes Planejados

Os cenários serão implementados na etapa futura. No backend, usar MockMvc com a cadeia real de segurança e banco de teste; revisar as sessões montadas manualmente para fornecer contexto autenticado e CSRF. Atributos `CLAI_USUARIO_*` isolados não deverão autenticar.

### API direta

| Cenário                                                                      | Verificação esperada                                                                                                                                  |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro anônimo, sessão expirada ou sessão apenas de CSRF, com ou sem token | `401`, JSON, sem redirecionamento ou gravação.                                                                                                        |
| Assistente com CSRF válido, inclusive enviando perfil profissional no corpo  | `403`, sem criação ou elevação de privilégio.                                                                                                         |
| Profissional com CSRF ausente, incorreto ou de outra sessão                  | `403`, sem gravação.                                                                                                                                  |
| Profissional criando cada perfil permitido                                   | `201`, persistência e hash corretos, sem senha, hash ou tokens na resposta.                                                                           |
| Consulta de sessão após cadastro                                             | Preservar a identidade e permissões do profissional; nova conta consegue login em outra sessão.                                                       |
| Dados ou perfil inválidos; e-mail duplicado                                  | `400` ou `409`, sem gravação adicional.                                                                                                               |
| Login inválido, conta inativa e login válido                                 | `401` para falhas; compatibilidade com hashes existentes e autenticação persistida no sucesso.                                                        |
| Obtenção e renovação de CSRF, logout e reutilização da sessão encerrada      | Token inicial não autentica; escritas usam token atualizado; sessão encerrada recebe `401`.                                                           |
| Regressão de permissões                                                      | Assistente somente consulta alunos; profissional mantém operações autorizadas; anônimo não acessa recursos protegidos. Incluir relatórios, PEI e PEA. |
| CORS e erros                                                                 | Preflight permitido sem autenticação, cabeçalho CSRF legível e contrato JSON `401`/`403`.                                                             |

### Interface

- Anônimo: somente login, sem cadastro público; acesso direto à rota interna não mostra nem envia o formulário.
- Assistente: sem menu ou formulário de usuários e sem acesso pela URL direta.
- Profissional: envio com cookie e CSRF, sucesso e identidade preservada, inclusive após recarregar a página.
- Envio pendente impede submissão duplicada; `400`, `409` e falha de rede permitem correção; `403` mantém sessão; `401` limpa dados protegidos e exige login.
- Verificar CSRF antes do login e renovação após login e logout. Atualizar os cenários Playwright de cadastro público e troca de sessão; manter os testes simulados e repetir o fluxo principal com backend real.

## 6. Arquivos e Componentes Envolvidos

Os caminhos `auth/` abaixo são relativos a `apps/backend/src/main/java/com/projetoCLAI/`.

| Arquivo ou componente                                              | Alteração futura                                                                                                                                                                |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/backend/pom.xml`                                             | Habilitar dependências de segurança e testes.                                                                                                                                   |
| `auth/SecurityConfig.java` (futuro)                                | Configurar filtros, identidade, authorities, encoder, sessão, CSRF, CORS e erros.                                                                                               |
| `auth/AuthController.java`                                         | Integrar autenticação e sessão; separar criação de usuário de login; fornecer CSRF inicial.                                                                                     |
| `auth/PerfilUsuario.java`                                          | Acrescentar `usuarios:cadastrar` somente ao profissional.                                                                                                                       |
| `auth/WebConfig.java` e `auth/AutorizacaoInterceptor.java`         | Transferir a proteção para os filtros e integrar CORS.                                                                                                                          |
| `apps/frontend/src/App.tsx` (`Login`, `Layout`, `Guard`, `Acesso`) | Cadastro interno e controle de rota, menu e permissão.                                                                                                                          |
| `apps/frontend/src/` (`lib/api.ts`, `types.ts`, `lib/demo.ts`)     | Novo contrato, permissão, CSRF e tratamento de sessão, incluindo o simulador.                                                                                                   |
| `apps/backend/src/test/java/com/projetoCLAI/`                      | Atualizar `ProjetoClaiApplicationTests.java`, `atendimento/HistoricoAtendimentoTests.java` e `planoacao/PlanoAcaoIntegrationTests.java` para a cadeia e os cenários planejados. |
| `apps/frontend/tests/` (`api.spec.ts`, `demo.spec.ts`)             | Cadastro interno, permissões, erros, CSRF e preservação da sessão.                                                                                                              |

Reutilizar os DTOs existentes quando aplicáveis e `context.tsx`, mantendo a autorização baseada nas permissões da sessão.
