package com.projetoCLAI.relatorio.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RelatorioHabilidadeDTO(

        @Min(value = 1, message = "A ordem mínima é 1.")
        @Max(value = 7, message = "A ordem máxima é 7.")
        Integer ordem,

        @NotBlank(message = "A habilidade desenvolvida é obrigatória.")
        String habilidadeDesenvolvida,

        @Pattern(
                regexp = "SATISFATORIO|BOM|OTIMO",
                message = "Nível de aprendizado inválido."
        )
        String nivelAprendizado,

        String observacoes
) {
}