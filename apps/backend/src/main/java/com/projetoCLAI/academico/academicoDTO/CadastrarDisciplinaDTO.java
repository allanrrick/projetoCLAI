package com.projetoCLAI.academico.academicoDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastrarDisciplinaDTO(
        @NotBlank(message = "O nome da disciplina é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String nome
) {}
