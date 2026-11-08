package com.projetoCLAI.relatorio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CriarRelatorioDTO(

        @NotNull(message = "O aluno é obrigatório.")
        @Positive(message = "O ID do aluno deve ser positivo.")
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

        @Valid
        List<RelatorioAspectoDTO> aspectos,

        @Valid
        @Size(max = 7, message = "O relatório pode possuir no máximo 7 habilidades.")
        List<RelatorioHabilidadeDTO> habilidades,

        String parecer,
        LocalDate dataRelatorio
) {
}