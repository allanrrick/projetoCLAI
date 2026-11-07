package com.projetoCLAI.pei.peiDTO;

import jakarta.validation.constraints.NotBlank;

public record CadastroPeiDTO(
        @NotBlank(message = "A matrícula do aluno é obrigatória")
        String matricula,

        @NotBlank(message = "As necessidades específicas são obrigatórias")
        String necessidadesEspecificas,

        @NotBlank(message = "Os objetivos são obrigatórios")
        String objetivos,

        @NotBlank(message = "As estratégias de acompanhamento são obrigatórias")
        String estrategiasAcompanhamento
) {
}
