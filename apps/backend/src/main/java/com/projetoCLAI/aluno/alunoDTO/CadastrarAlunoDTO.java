package com.projetoCLAI.aluno.alunoDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastrarAlunoDTO(
        @NotBlank
        @Size(max = 20)
        String matricula,

        @NotBlank
        @Size(max = 150)
        String nome,

        @Email
        @Size(max = 150)
        String email,

        @NotBlank
        @Size(max = 100)
        String curso
) {}
