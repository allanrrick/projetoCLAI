package com.projetoCLAI.planoacao;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlanoAcaoResponseDTO(
        Long idPlano,
        Long idAluno,
        String alunoNome,
        String alunoMatricula,
        String alunoCurso,
        String alunoEmail,
        String responsavelNome,
        String responsavelParentesco,
        String responsavelContato,
        boolean possuiComorbidades,
        String comorbidades,
        boolean usoMedicacaoContinua,
        String medicacaoContinua,
        String servicosApoio,
        String documentosComprobatorios,
        String necessidadesEspecificas,
        String percursoEducacional,
        String principaisDemandas,
        String propostasIntervencao,
        String assinaturaCoordenador,
        LocalDate dataDocumento,
        String autor,
        LocalDateTime criadoEm
) {
    public static PlanoAcaoResponseDTO fromEntity(PlanoAcao plano) {
        return new PlanoAcaoResponseDTO(
                plano.getIdPlano(),
                plano.getAluno().getIdAluno(),
                plano.getAluno().getNome(),
                plano.getAluno().getMatricula(),
                plano.getAluno().getCurso(),
                plano.getAluno().getEmail(),
                plano.getResponsavelNome(),
                plano.getResponsavelParentesco(),
                plano.getResponsavelContato(),
                plano.isPossuiComorbidades(),
                plano.getComorbidades(),
                plano.isUsoMedicacaoContinua(),
                plano.getMedicacaoContinua(),
                plano.getServicosApoio(),
                plano.getDocumentosComprobatorios(),
                plano.getNecessidadesEspecificas(),
                plano.getPercursoEducacional(),
                plano.getPrincipaisDemandas(),
                plano.getPropostasIntervencao(),
                plano.getAssinaturaCoordenador(),
                plano.getDataDocumento(),
                plano.getAutor(),
                plano.getCriadoEm()
        );
    }
}
