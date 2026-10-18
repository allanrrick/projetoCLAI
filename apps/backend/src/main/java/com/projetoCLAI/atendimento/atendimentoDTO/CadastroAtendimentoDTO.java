package com.projetoCLAI.atendimento.atendimentoDTO;

import jakarta.validation.constraints.NotBlank;
import org.springframework.web.multipart.MultipartFile;

public record CadastroAtendimentoDTO(
        @NotBlank(message = "A matrícula do aluno é obrigatória")
        String matricula,

        @NotBlank(message = "A data do atendimento é obrigatória")
        String data,

        @NotBlank(message = "A hora do atendimento é obrigatória")
        String hora,

        @NotBlank(message = "As observações do atendimento são obrigatórias")
        String observacoes,

        MultipartFile documento
) {}

