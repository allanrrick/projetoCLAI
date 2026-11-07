package com.projetoCLAI.pei.DTO;

import jakarta.validation.constraints.NotBlank;

public record CadastroAfinidadesDTO(
        @NotBlank
        String afinidade
) {
}
