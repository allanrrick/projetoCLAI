package com.projetoCLAI.atendimento;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.auth.AuthController;
import com.projetoCLAI.auth.PerfilUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class HistoricoAtendimentoTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AlunoRepository alunoRepository;

	@Autowired
	private AtendimentoRepository atendimentoRepository;

	@MockitoBean
	private FileStorageService fileStorageService;

	private Aluno aluno;
	private Aluno outroAluno;
	private Aluno alunoSemHistorico;
	private Atendimento inicial;
	private Atendimento manha;
	private Atendimento tarde;
	private Atendimento finalDoPeriodo;

	@BeforeEach
	void prepararHistorico() {
		aluno = salvarAluno("HIST001", "Ana Inclusão");
		outroAluno = salvarAluno("OUTRO001", "Bruno Santos");
		alunoSemHistorico = salvarAluno("VAZIO001", "Clara Lima");

		tarde = salvarAtendimento(aluno, "2026-10-12", "16:45",
				"Avaliação da organização dos estudos", "Ana Souza",
				"uploads\\123e4567-e89b-12d3-a456-426614174001_Relatório de evolução.pdf");
		inicial = salvarAtendimento(aluno, "2026-10-10", "09:00",
				"Acolhimento com orientação inicial", "Mariana Costa", null);
		finalDoPeriodo = salvarAtendimento(aluno, "2026-10-15", "10:15",
				"Orientação sobre rotina de estudos", "Carlos Lima", null);
		manha = salvarAtendimento(aluno, "2026-10-12", "08:30",
				"Orientação sobre recursos acessíveis", "José Oliveira",
				"uploads/123e4567-e89b-12d3-a456-426614174000_Plano de inclusão.pdf");
		salvarAtendimento(outroAluno, "2026-10-20", "11:00",
				"Orientação exclusiva de outro aluno", "José Oliveira", null);
	}

	@Test
	void ordenaPorDataEHoraDecrescentesPorPadraoSemVazarOutroAluno() throws Exception {
		verificarOrdem(mockMvc.perform(consultar()), finalDoPeriodo, tarde, manha, inicial);
	}

	@Test
	void aceitaOrdemDecrescenteExplicita() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("ordem", "desc")),
				finalDoPeriodo, tarde, manha, inicial);
	}

	@Test
	void ordenaPorDataEHoraCrescentes() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("ordem", "asc")),
				inicial, manha, tarde, finalDoPeriodo);
	}

	@Test
	void retornaListaVaziaParaAlunoSemAtendimentos() throws Exception {
		mockMvc.perform(get("/atendimentos/{matricula}", alunoSemHistorico.getMatricula())
				.session(sessao(PerfilUsuario.PROFISSIONAL_CLAI)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens", hasSize(0)))
				.andExpect(jsonPath("$.pagina").value(0))
				.andExpect(jsonPath("$.tamanho").value(10))
				.andExpect(jsonPath("$.totalItens").value(0))
				.andExpect(jsonPath("$.temMais").value(false));
	}

	@Test
	void retorna404ParaMatriculaInexistente() throws Exception {
		mockMvc.perform(get("/atendimentos/INEXISTENTE")
				.session(sessao(PerfilUsuario.PROFISSIONAL_CLAI)))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.detail").value(
						"Aluno não encontrado com a matrícula: INEXISTENTE"));
	}

	@Test
	void retornaSomenteOsSeisCamposDoContratoDto() throws Exception {
		mockMvc.perform(consultar().param("q", "organizacao"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.itens", hasSize(1)))
				.andExpect(jsonPath("$.pagina").value(0))
				.andExpect(jsonPath("$.tamanho").value(10))
				.andExpect(jsonPath("$.totalItens").value(1))
				.andExpect(jsonPath("$.temMais").value(false))
				.andExpect(jsonPath("$.itens[0].*", hasSize(6)))
				.andExpect(jsonPath("$.itens[0].id").value(tarde.getId().intValue()))
				.andExpect(jsonPath("$.itens[0].data").value("2026-10-12"))
				.andExpect(jsonPath("$.itens[0].hora").value("16:45"))
				.andExpect(jsonPath("$.itens[0].observacoes").value(tarde.getObservacoes()))
				.andExpect(jsonPath("$.itens[0].profissional").value("Ana Souza"))
				.andExpect(jsonPath("$.itens[0].documentoUrl").value(tarde.getDocumentoUrl()))
				.andExpect(jsonPath("$.itens[0].aluno").doesNotExist())
				.andExpect(jsonPath("$.itens[0].idAtendimento").doesNotExist());
	}

	@ParameterizedTest
	@ValueSource(strings = { "orientacao", "ORIENTAÇÃO", "  orientacao  " })
	void buscaNasObservacoesIgnorandoAcentosCaixaEEspacosExternos(String busca) throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", busca)), finalDoPeriodo, manha, inicial);
	}

	@ParameterizedTest
	@ValueSource(strings = { "jose", "JOSÉ", "  Jose  " })
	void buscaPorProfissionalIgnorandoAcentosCaixaEEspacosExternos(String busca) throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", busca)), manha);
	}

	@Test
	void buscaPorNomeDoAnexoIgnorandoAcentosCaixaEEspacosExternos() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", "  PLANO DE INCLUSAO  ")), manha);
	}

	@Test
	void buscaAnexoArmazenadoComSeparadorDoWindows() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", "EVOLUCAO")), tarde);
	}

	@ParameterizedTest
	@ValueSource(strings = { "", " ", " \t  " })
	void ignoraBuscaVaziaOuComEspacos(String busca) throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", busca)), finalDoPeriodo, tarde, manha, inicial);
	}

	@ParameterizedTest
	@ValueSource(strings = { "123e4567", "uploads", "sem correspondência" })
	void naoBuscaNoPrefixoUuidOuDiretorioENaoRetornaResultadosSemCorrespondencia(String busca)
			throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("q", busca)));
	}

	@Test
	void filtraPeriodoIncluindoAsDuasDatasLimite() throws Exception {
		verificarOrdem(mockMvc.perform(consultar()
				.param("inicio", "2026-10-12").param("fim", "2026-10-15")),
				finalDoPeriodo, tarde, manha);
	}

	@Test
	void aceitaPeriodoComInicioEFimNoMesmoDia() throws Exception {
		verificarOrdem(mockMvc.perform(consultar()
				.param("inicio", "2026-10-12").param("fim", "2026-10-12")), tarde, manha);
	}

	@Test
	void aceitaSomenteDataInicialInclusiva() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("inicio", "2026-10-12")),
				finalDoPeriodo, tarde, manha);
	}

	@Test
	void aceitaSomenteDataFinalInclusiva() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("fim", "2026-10-12")), tarde, manha, inicial);
	}

	@Test
	void combinaBuscaPeriodoEOrdemCrescente() throws Exception {
		verificarOrdem(mockMvc.perform(consultar()
				.param("q", "ORIENTACAO")
				.param("inicio", "2026-10-10")
				.param("fim", "2026-10-12")
				.param("ordem", "asc")), inicial, manha);
	}

	@Test
	void rejeitaPeriodoInvertidoComMensagemEmPortugues() throws Exception {
		mockMvc.perform(consultar().param("inicio", "2026-10-15").param("fim", "2026-10-10"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detail").value(
						"A data final deve ser igual ou posterior à data inicial."));
	}

	@Test
	void rejeitaOrdemInvalida() throws Exception {
		mockMvc.perform(consultar().param("ordem", "invalida"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detail").value("A ordenação deve ser 'asc' ou 'desc'."));
	}

	@ParameterizedTest
	@CsvSource({ "inicio, 19/10/2026", "fim, 19/10/2026", "inicio, 2026-13-01", "fim, 2026-13-01" })
	void rejeitaDataForaDoFormatoIsoOuInexistente(String parametro, String data) throws Exception {
		mockMvc.perform(consultar().param(parametro, data))
				.andExpect(status().isBadRequest());
	}

	@Test
	void exigeSessaoParaConsultarHistorico() throws Exception {
		mockMvc.perform(get("/atendimentos/{matricula}", aluno.getMatricula()))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void rejeitaPerfilSemPermissaoDeConsultarAtendimentos() throws Exception {
		mockMvc.perform(get("/atendimentos/{matricula}", aluno.getMatricula())
				.session(sessao(PerfilUsuario.ASSISTENTE)))
				.andExpect(status().isForbidden());
	}

	@Test
	void paginaHistoricoMantendoOrdemSemDuplicacao() throws Exception {
		verificarOrdem(mockMvc.perform(consultar().param("pagina", "0").param("tamanho", "2")),
				finalDoPeriodo, tarde)
				.andExpect(jsonPath("$.pagina").value(0))
				.andExpect(jsonPath("$.tamanho").value(2))
				.andExpect(jsonPath("$.totalItens").value(4))
				.andExpect(jsonPath("$.temMais").value(true));

		verificarOrdem(mockMvc.perform(consultar().param("pagina", "1").param("tamanho", "2")),
				manha, inicial)
				.andExpect(jsonPath("$.pagina").value(1))
				.andExpect(jsonPath("$.tamanho").value(2))
				.andExpect(jsonPath("$.totalItens").value(4))
				.andExpect(jsonPath("$.temMais").value(false));

		verificarOrdem(mockMvc.perform(consultar().param("pagina", "2").param("tamanho", "2")))
				.andExpect(jsonPath("$.pagina").value(2))
				.andExpect(jsonPath("$.tamanho").value(2))
				.andExpect(jsonPath("$.totalItens").value(4))
				.andExpect(jsonPath("$.temMais").value(false));
	}

	@Test
	void paginaComDesempateDeterministicoQuandoDataEHoraCoincidem() throws Exception {
		Aluno alunoEmpate = salvarAluno("EMPATE01", "Lucas Vieira");
		Atendimento primeiro = salvarAtendimento(alunoEmpate, "2026-10-19", "10:00",
				"Primeiro registro no mesmo horário", "Ana Souza", null);
		Atendimento segundo = salvarAtendimento(alunoEmpate, "2026-10-19", "10:00",
				"Segundo registro no mesmo horário", "Ana Souza", null);

		verificarOrdem(mockMvc.perform(get("/atendimentos/{matricula}", alunoEmpate.getMatricula())
				.session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
				.param("ordem", "desc")
				.param("pagina", "0")
				.param("tamanho", "1")), segundo)
				.andExpect(jsonPath("$.temMais").value(true));

		verificarOrdem(mockMvc.perform(get("/atendimentos/{matricula}", alunoEmpate.getMatricula())
				.session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
				.param("ordem", "desc")
				.param("pagina", "1")
				.param("tamanho", "1")), primeiro)
				.andExpect(jsonPath("$.temMais").value(false));
	}

	@ParameterizedTest
	@CsvSource({ "pagina, -1", "tamanho, 0", "tamanho, 51" })
	void rejeitaPaginaOuTamanhoInvalidos(String parametro, String valor) throws Exception {
		mockMvc.perform(consultar().param(parametro, valor))
				.andExpect(status().isBadRequest());
	}

	private Aluno salvarAluno(String matricula, String nome) {
		Aluno novoAluno = new Aluno();
		novoAluno.setMatricula(matricula);
		novoAluno.setNome(nome);
		novoAluno.setCurso("Análise e Desenvolvimento de Sistemas");
		return alunoRepository.save(novoAluno);
	}

	private Atendimento salvarAtendimento(Aluno estudante, String data, String hora,
			String observacoes, String profissional, String documentoUrl) {
		return atendimentoRepository.save(new Atendimento(
				data, hora, observacoes, documentoUrl, estudante, profissional));
	}

	private MockHttpServletRequestBuilder consultar() {
		return get("/atendimentos/{matricula}", aluno.getMatricula())
				.session(sessao(PerfilUsuario.PROFISSIONAL_CLAI));
	}

	private MockHttpSession sessao(PerfilUsuario perfil) {
		MockHttpSession session = new MockHttpSession();
		session.setAttribute(AuthController.ATTR_USUARIO_ID, 1L);
		session.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "historico@example.com");
		session.setAttribute(AuthController.ATTR_USUARIO_PERFIL, perfil.name());
		return session;
	}

	private ResultActions verificarOrdem(ResultActions resultado, Atendimento... esperados) throws Exception {
		resultado.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.itens", hasSize(esperados.length)));
		for (int indice = 0; indice < esperados.length; indice++) {
			resultado.andExpect(jsonPath("$.itens[" + indice + "].id").value(esperados[indice].getId().intValue()))
					.andExpect(jsonPath("$.itens[" + indice + "].data").value(esperados[indice].getData()))
					.andExpect(jsonPath("$.itens[" + indice + "].hora").value(esperados[indice].getHora()));
		}
		return resultado;
	}
}
