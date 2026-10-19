package com.projetoCLAI.planoacao.planoacaoDTO;

import com.projetoCLAI.planoacao.PlanoAcao;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlanoAcaoResponseDTO(
        Long idPlanoAcao, Long idAluno, String autorNome, LocalDateTime dataCriacao,
        String periodoLetivo, String periodoIngresso, LocalDate dataNascimento,
        String telefoneAluno, String nomeResponsavel, String parentescoResponsavel,
        String telefoneResponsavel, String emailResponsavel,
        Boolean possuiComorbidade, String comorbidades,
        Boolean usaMedicacaoContinua, String medicacoes,
        Boolean frequentaServicosApoio, String servicosApoio,
        Boolean apresentouDocumentos, String documentosComprobatorios,
        String necessidadesEspecificas, String percursoEducacional,
        String principaisDemandas, String propostasIntervencao,
        String nomeCoordenador, LocalDate dataDocumento
) {
    public PlanoAcaoResponseDTO(PlanoAcao plano) {
        this(plano.getIdPlanoAcao(), plano.getAluno().getIdAluno(),
                plano.getAutor().getNome(), plano.getDataCriacao(),
                plano.getPeriodoLetivo(), plano.getPeriodoIngresso(), plano.getDataNascimento(),
                plano.getTelefoneAluno(), plano.getNomeResponsavel(), plano.getParentescoResponsavel(),
                plano.getTelefoneResponsavel(), plano.getEmailResponsavel(),
                plano.getPossuiComorbidade(), plano.getComorbidades(),
                plano.getUsaMedicacaoContinua(), plano.getMedicacoes(),
                plano.getFrequentaServicosApoio(), plano.getServicosApoio(),
                plano.getApresentouDocumentos(), plano.getDocumentosComprobatorios(),
                plano.getNecessidadesEspecificas(), plano.getPercursoEducacional(),
                plano.getPrincipaisDemandas(), plano.getPropostasIntervencao(),
                plano.getNomeCoordenador(), plano.getDataDocumento());
    }
}
