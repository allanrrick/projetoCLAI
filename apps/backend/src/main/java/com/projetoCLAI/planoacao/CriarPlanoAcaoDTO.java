package com.projetoCLAI.planoacao;

import java.time.LocalDate;

public record CriarPlanoAcaoDTO(
        Long idAluno,
        String responsavelNome,
        String responsavelParentesco,
        String responsavelContato,
        Boolean possuiComorbidades,
        String comorbidades,
        Boolean usoMedicacaoContinua,
        String medicacaoContinua,
        String servicosApoio,
        String documentosComprobatorios,
        String necessidadesEspecificas,
        String percursoEducacional,
        String principaisDemandas,
        String propostasIntervencao,
        String assinaturaCoordenador,
        LocalDate dataDocumento,
        String autor
) {
}
