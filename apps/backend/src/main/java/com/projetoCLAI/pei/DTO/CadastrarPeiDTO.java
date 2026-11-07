package com.projetoCLAI.pei.DTO;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CadastrarPeiDTO(
        @NotBlank(message = "Matricula do aluno é obrigatoria")
        String alunoMatricula,

        @NotBlank(message = "Periodo Letivo do é aluno obrigatorio")
        String periodoLetivo,

        @NotBlank(message = "Histórico do aluno é obrigatorio")
        String historico,

        @NotBlank(message = "Necessidades Específicas do aluno são obrigatorias")
        String necessidades,

        @NotEmpty(message = "O PEI deve conter ao menos uma afinidade")
        List<@Valid CadastroAfinidadesDTO> afinidades,

        @NotBlank(message = "Dificuldades do aluno são obrigatorias")
        String dificuldades,

        @NotBlank(message = "Propostas de adaptacao para o aluno são obrigatorias")
        String propostas

) {
}
