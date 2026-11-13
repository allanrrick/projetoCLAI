package com.projetoCLAI.academico.academicoDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastrarCursoDTO(
        @NotBlank(message = "O nome do curso é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String nome
) {}
