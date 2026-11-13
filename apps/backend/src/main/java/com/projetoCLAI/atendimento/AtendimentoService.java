package com.projetoCLAI.atendimento;

import com.projetoCLAI.atendimento.atendimentoDTO.HistoricoAtendimentoDTO;
import com.projetoCLAI.atendimento.atendimentoDTO.HistoricoAtendimentoPaginadoDTO;
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

	public static final int TAMANHO_PAGINA_PADRAO = 10;
	public static final int TAMANHO_PAGINA_MAXIMO = 50;

	private final AtendimentoRepository atendimentoRepository;

	public HistoricoAtendimentoPaginadoDTO consultarHistorico(
			String matricula, String q, LocalDate inicio, LocalDate fim, String ordem,
			int pagina, int tamanho) {
		if (inicio != null && fim != null && fim.isBefore(inicio)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"A data final deve ser igual ou posterior à data inicial.");
		}
		if (!"asc".equals(ordem) && !"desc".equals(ordem)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"A ordenação deve ser 'asc' ou 'desc'.");
		}
		if (pagina < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"A página deve ser maior ou igual a zero.");
		}
		if (tamanho < 1 || tamanho > TAMANHO_PAGINA_MAXIMO) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"O tamanho da página deve estar entre 1 e " + TAMANHO_PAGINA_MAXIMO + ".");
		}

		String busca = normalizar(q).trim();
		String dataInicio = inicio == null ? null : inicio.toString();
		String dataFim = fim == null ? null : fim.toString();
		Comparator<Atendimento> comparador = Comparator.comparing(Atendimento::getData)
				.thenComparing(Atendimento::getHora)
				.thenComparing(Atendimento::getId);
		if ("desc".equals(ordem)) {
			comparador = comparador.reversed();
		}

		List<Atendimento> filtrados = atendimentoRepository.findByAlunoMatricula(matricula).stream()
				.filter(item -> dataInicio == null || item.getData().compareTo(dataInicio) >= 0)
				.filter(item -> dataFim == null || item.getData().compareTo(dataFim) <= 0)
				.filter(item -> busca.isEmpty()
						|| normalizar(item.getObservacoes()).contains(busca)
						|| normalizar(item.getProfissional()).contains(busca)
						|| normalizar(nomeDocumento(item.getDocumentoUrl())).contains(busca))
				.sorted(comparador)
				.toList();

		long totalItens = filtrados.size();
		long deslocamento = (long) pagina * tamanho;
		List<HistoricoAtendimentoDTO> itens = deslocamento >= totalItens
				? List.of()
				: filtrados.stream()
						.skip(deslocamento)
						.limit(tamanho)
						.map(HistoricoAtendimentoDTO::new)
						.toList();
		boolean temMais = deslocamento + itens.size() < totalItens;

		return new HistoricoAtendimentoPaginadoDTO(itens, pagina, tamanho, totalItens, temMais);
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
