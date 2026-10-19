package com.projetoCLAI.atendimento;

import com.projetoCLAI.atendimento.atendimentoDTO.HistoricoAtendimentoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AtendimentoService {

	private final AtendimentoRepository atendimentoRepository;

	public List<HistoricoAtendimentoDTO> consultarHistorico(
			String matricula, String q, LocalDate inicio, LocalDate fim, String ordem) {
		if (inicio != null && fim != null && fim.isBefore(inicio)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"A data final deve ser igual ou posterior à data inicial.");
		}
		if (!"asc".equals(ordem) && !"desc".equals(ordem)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"A ordenação deve ser 'asc' ou 'desc'.");
		}

		String busca = normalizar(q).trim();
		String dataInicio = inicio == null ? null : inicio.toString();
		String dataFim = fim == null ? null : fim.toString();
		Comparator<Atendimento> comparador = Comparator.comparing(Atendimento::getData)
				.thenComparing(Atendimento::getHora);
		if ("desc".equals(ordem)) {
			comparador = comparador.reversed();
		}

		return atendimentoRepository.findByAlunoMatricula(matricula).stream()
				.filter(item -> dataInicio == null || item.getData().compareTo(dataInicio) >= 0)
				.filter(item -> dataFim == null || item.getData().compareTo(dataFim) <= 0)
				.filter(item -> busca.isEmpty()
						|| normalizar(item.getObservacoes()).contains(busca)
						|| normalizar(item.getProfissional()).contains(busca)
						|| normalizar(nomeDocumento(item.getDocumentoUrl())).contains(busca))
				.sorted(comparador)
				.map(HistoricoAtendimentoDTO::new)
				.toList();
	}

	private static String normalizar(String texto) {
		return texto == null ? "" : Normalizer.normalize(texto, Normalizer.Form.NFD)
				.replaceAll("\\p{M}+", "")
				.toLowerCase(Locale.ROOT);
	}

	private static String nomeDocumento(String caminho) {
		if (caminho == null) {
			return "";
		}
		String normalizado = caminho.replace('\\', '/');
		return normalizado.substring(normalizado.lastIndexOf('/') + 1)
				.replaceFirst("^[0-9a-fA-F-]{36}_", "");
	}
}
