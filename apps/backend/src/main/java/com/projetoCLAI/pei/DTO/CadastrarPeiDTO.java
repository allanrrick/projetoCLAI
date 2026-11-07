package com.projetoCLAI.pei.DTO;


import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record CadastrarPeiDTO(
        @NotBlank
        String alunoMatricula,

        @NotBlank
        String periodoLetivo,

        @NotBlank
        String historico,

        @NotBlank
        String necessidades,

        List<CadastroAfinidadesDTO> afinidades,

        @NotBlank
        String dificuldades,

        @NotBlank
        String propostas,

        @NotBlank
        LocalDate dataCriacao

) {
}
