package com.projetoCLAI.relatorio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RelatorioAspectoDTO(

        @NotBlank(message = "O grupo do aspecto é obrigatório.")
        @Pattern(
                regexp = "RELACIONAMENTO|COGNITIVO|SOCIOEMOCIONAL",
                message = "Grupo de aspecto inválido."
        )
        String grupo,

        @NotBlank(message = "A opção do aspecto é obrigatória.")
        String opcao,

        String descricaoOutros
) {
}