package com.projetoCLAI.planoacao.planoacaoDTO;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CadastrarPlanoAcaoDTO(
        @NotNull(message = "Selecione o aluno.") @Positive Long idAluno,
        @NotBlank(message = "Informe o período letivo.") @Size(max = 20) String periodoLetivo,
        @Size(max = 20) String periodoIngresso,
        @PastOrPresent(message = "A data de nascimento não pode ser futura.") LocalDate dataNascimento,
        @Size(max = 30) String telefoneAluno,
        @Size(max = 150) String nomeResponsavel,
        @Size(max = 50) String parentescoResponsavel,
        @Size(max = 30) String telefoneResponsavel,
        @Email(message = "Informe um e-mail válido para o responsável.") @Size(max = 150) String emailResponsavel,
        @NotNull(message = "Informe se há comorbidade relevante.") Boolean possuiComorbidade,
        @Size(max = 10000) String comorbidades,
        @NotNull(message = "Informe se há medicação contínua.") Boolean usaMedicacaoContinua,
        @Size(max = 10000) String medicacoes,
        @NotNull(message = "Informe se frequenta serviços de apoio.") Boolean frequentaServicosApoio,
        @Size(max = 10000) String servicosApoio,
        @NotNull(message = "Informe se apresentou documentos comprobatórios.") Boolean apresentouDocumentos,
        @Size(max = 10000) String documentosComprobatorios,
        @NotBlank(message = "Descreva as necessidades específicas.") @Size(max = 20000) String necessidadesEspecificas,
        @NotBlank(message = "Descreva o percurso educacional.") @Size(max = 20000) String percursoEducacional,
        @NotBlank(message = "Descreva as principais demandas.") @Size(max = 20000) String principaisDemandas,
        @NotBlank(message = "Descreva as propostas de intervenção.") @Size(max = 20000) String propostasIntervencao,
        @NotBlank(message = "Informe o nome do coordenador.") @Size(max = 150) String nomeCoordenador,
        @NotNull(message = "Informe a data do documento.") LocalDate dataDocumento
) {}
