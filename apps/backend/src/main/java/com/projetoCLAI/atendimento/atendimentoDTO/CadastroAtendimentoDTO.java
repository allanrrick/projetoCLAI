package com.projetoCLAI.atendimento.atendimentoDTO;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;

public record CadastroAtendimentoDTO(
        @NotNull(message = "O ID do aluno é obrigatório")
        Long idAluno,

        @NotNull(message = "A data e hora do atendimento são obrigatórias")
        LocalDateTime dataHora,

        String observacoes,

        MultipartFile documento
) {}
