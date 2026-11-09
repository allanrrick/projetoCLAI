# US 04 — Plano de Ação da CLAI (ANEXO II - IFPB)

Documento de especificação da matriz de validação, persistência e controle de acesso dos Planos de Ação da CLAI (Issues #36, #37, #38, #39, #40 e #41).

## 1. Matriz de Campos (Obrigatórios, Opcionais e Condicionais)

| Campo | Tipo | Regra | Observação |
| :--- | :--- | :--- | :--- |
| `idAluno` | `Long` | **Obrigatório** | Deve referenciar um aluno existente em `public.aluno(id_aluno)`. |
| `responsavelNome` | `String(150)` | Opcional | Nome do familiar ou responsável de referência. |
| `responsavelParentesco` | `String(80)` | Opcional | Vínculo/parentesco com o estudante. |
| `responsavelContato` | `String(100)` | Opcional | Telefone ou e-mail de contato do responsável. |
| `possuiComorbidades` | `Boolean` | **Obrigatório** | Indica se o estudante apresenta comorbidades associadas. |
| `comorbidades` | `TEXT` | **Condicional** | **Obrigatório** (não vazio/não apenas espaços) quando `possuiComorbidades = true`. |
| `usoMedicacaoContinua` | `Boolean` | **Obrigatório** | Indica se o estudante faz uso de medicação contínua. |
| `medicacaoContinua` | `TEXT` | **Condicional** | **Obrigatório** (não vazio/não apenas espaços) quando `usoMedicacaoContinua = true`. |
| `servicosApoio` | `TEXT` | Opcional | Serviços de apoio especializados utilizados ou demandados. |
| `documentosComprobatorios` | `TEXT` | Opcional | Laudos, relatórios técnicos ou documentos apresentados. |
| `necessidadesEspecificas` | `TEXT` | **Obrigatório** | Seção narrativa 1 do ANEXO II (rejeita vazio ou apenas espaços). |
| `percursoEducacional` | `TEXT` | **Obrigatório** | Seção narrativa 2: avanços, dificuldades e potencialidades no percurso educacional. |
| `principaisDemandas` | `TEXT` | **Obrigatório** | Seção narrativa 3: principais demandas identificadas. |
| `propostasIntervencao` | `TEXT` | **Obrigatório** | Seção narrativa 4: propostas iniciais de intervenção. |
| `assinaturaCoordenador` | `String(150)` | **Obrigatório** | Identificação/assinatura textual da coordenação ou responsável técnico pelo plano. |
| `dataDocumento` | `LocalDate` | **Obrigatório** | Data oficial de emissão do documento. |
| `autor` | `String(150)` | **Gerado pelo servidor** | Extraído exclusivamente da sessão autenticada (`CLAI_USUARIO_NOME`). |
| `criadoEm` | `LocalDateTime` | **Gerado pelo servidor** | Data/hora de criação do registro no servidor. |

## 2. Tratamento da Assinatura e Data do Documento

- **Assinatura do coordenador (`assinaturaCoordenador`)**: armazenada como identificação textual obrigatória do profissional/coordenador responsável pela emissão do plano, pré-preenchida na interface com o nome do profissional autenticado.
- **Data do documento (`dataDocumento`)**: data de referência do documento no formato ISO (`YYYY-MM-DD`), obrigatória no formulário e na API.
- **Autoria de auditoria (`autor` e `criadoEm`)**: preenchida pelo backend a partir da `HttpSession`, impedindo falsificação de autoria pelo cliente.

## 3. Controle de Acesso

- Permissões adicionadas ao perfil `PROFISSIONAL_CLAI`: `planos:consultar` e `planos:cadastrar`.
- O perfil `ASSISTENTE` permanece apenas com `alunos:consultar`, recebendo HTTP `403 Forbidden` em `/planos-acao` e `/planos-acao/**`.
- Requisições sem sessão ativa recebem HTTP `401 Unauthorized`.
