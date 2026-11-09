package com.projetoCLAI.pei.DTO;

import jakarta.validation.constraints.NotBlank;

public record CadastroAfinidadesDTO(
        @NotBlank(message = "O texto da afinidade não pode estar em branco.")
        String afinidade
) {
}
