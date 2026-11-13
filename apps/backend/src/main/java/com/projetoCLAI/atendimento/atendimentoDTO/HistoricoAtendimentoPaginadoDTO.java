package com.projetoCLAI.atendimento.atendimentoDTO;

import java.util.List;

public record HistoricoAtendimentoPaginadoDTO(
		List<HistoricoAtendimentoDTO> itens,
		int pagina,
		int tamanho,
		long totalItens,
		boolean temMais
) {
}
