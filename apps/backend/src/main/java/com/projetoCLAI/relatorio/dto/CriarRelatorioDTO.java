package com.projetoCLAI.relatorio.dto;

import java.time.LocalDate;
import java.util.List;

public record CriarRelatorioDTO(
        Long alunoId,
        String periodoLetivo,
        String componenteCurricular,
        String docente,

        String comentarioRelacionamento,
        String comentarioCognitivo,
        String comentarioSocioemocional,

        String avancosGerais,
        String dificuldadesAprendizagem,
        String fatoresExternos,

        List<RelatorioAspectoDTO> aspectos,
        List<RelatorioHabilidadeDTO> habilidades,

        String parecer,
        LocalDate dataRelatorio
) {
}