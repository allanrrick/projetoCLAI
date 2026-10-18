package com.projetoCLAI.atendimento.atendimentoDTO;

import com.projetoCLAI.atendimento.Atendimento;
import java.time.LocalDateTime;

public record AtendimentoResponseDTO(
        Long id,
        String data,
        String hora,
        String observacoes,
        String documentoUrl
) {
    public AtendimentoResponseDTO(Atendimento atendimento) {
        this(
                atendimento.getId(),
                atendimento.getData(),
                atendimento.getHora(),
                atendimento.getObservacoes(),
                atendimento.getDocumentoUrl()
        );
    }
}