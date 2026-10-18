package com.projetoCLAI.atendimento.atendimentoDTO;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;

public record CadastroAtendimentoDTO(
        @NotNull(message = "A matricula do aluno é obrigatória")
        String matricula,

        @NotNull()
        String data,

        @NotNull()
        String hora,

        String observacoes,

        MultipartFile documento
) {}
