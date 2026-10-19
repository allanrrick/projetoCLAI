package com.projetoCLAI.atendimento.atendimentoDTO;

import com.projetoCLAI.atendimento.Atendimento;

public record HistoricoAtendimentoDTO(
		Long id,
		String data,
		String hora,
		String observacoes,
		String profissional,
		String documentoUrl
) {
	public HistoricoAtendimentoDTO(Atendimento atendimento) {
		this(
				atendimento.getId(),
				atendimento.getData(),
				atendimento.getHora(),
				atendimento.getObservacoes(),
				atendimento.getProfissional(),
				atendimento.getDocumentoUrl()
		);
	}
}
