package com.projetoCLAI.pea;

import jakarta.validation.constraints.NotBlank;

public record CadastrarPeaDTO(
        @NotBlank(message = "Matrícula do aluno é obrigatória")
        String alunoMatricula,

        @NotBlank(message = "Disciplina é obrigatória")
        String disciplina,

        @NotBlank(message = "Período letivo é obrigatório")
        String periodoLetivo,

        @NotBlank(message = "Docente é obrigatório")
        String docente,

        @NotBlank(message = "Objetivos adaptados são obrigatórios")
        String objetivos,

        @NotBlank(message = "Conteúdos programáticos são obrigatórios")
        String conteudos,

        @NotBlank(message = "Estratégias de ensino são obrigatórias")
        String estrategiasEnsino,

        @NotBlank(message = "Avaliação adaptada é obrigatória")
        String avaliacaoAdaptada
) {
}
