package com.projetoCLAI.planoacao;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.atendimento.FileStorageService;
import com.projetoCLAI.auth.*;
import jakarta.persistence.EntityManager;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanoAcaoApiTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private AlunoRepository alunoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PlanoAcaoRepository planoRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private ObjectMapper json;
    @MockitoBean private FileStorageService fileStorageService;

    private Aluno aluno;
    private Usuario autor;
    private MockHttpSession sessao;

    @BeforeEach
    void preparar() {
        aluno = new Aluno();
        aluno.setNome("Estudante de teste");
        aluno.setMatricula("PLANOAPI001");
        aluno.setCurso("ADS");
        alunoRepository.save(aluno);
        autor = usuarioRepository.save(new Usuario("Autor de teste", "autor-api@example.com",
                "hash-de-teste", "PROFISSIONAL_CLAI"));
        sessao = new MockHttpSession();
        sessao.setAttribute(AuthController.ATTR_USUARIO_ID, autor.getIdUsuario());
        sessao.setAttribute(AuthController.ATTR_USUARIO_EMAIL, autor.getEmail());
        sessao.setAttribute(AuthController.ATTR_USUARIO_PERFIL, "PROFISSIONAL_CLAI");
        sessao.setAttribute(AuthController.ATTR_CSRF_TOKEN, "csrf-plano");
    }

    @Test
    void cadastraEConsultaSemExporUsuarioOuMisturarAlunos() throws Exception {
        Map<String, Object> dados = dadosValidos();
        dados.put("autorId", -1);
        dados.put("dataCriacao", "2000-01-01T00:00:00");
        mockMvc.perform(post("/planos-acao").session(sessao).header("X-CSRF-TOKEN", "csrf-plano")
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPlanoAcao").isNumber())
                .andExpect(jsonPath("$.idAluno").value(aluno.getIdAluno().intValue()))
                .andExpect(jsonPath("$.autorNome").value("Autor de teste"))
                .andExpect(jsonPath("$.autor").doesNotExist())
                .andExpect(content().string(not(containsString("hash-de-teste"))));
        entityManager.flush();
        entityManager.clear();
        PlanoAcao plano = planoRepository.findAll().getFirst();
        assertEquals(autor.getIdUsuario(), plano.getAutor().getIdUsuario());
        assertTrue(plano.getDataCriacao().getYear() >= 2026);
        mockMvc.perform(get("/planos-acao/aluno/{id}", aluno.getIdAluno()).session(sessao))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].necessidadesEspecificas").value("Inclusão e apoio\nSegunda linha."));

        Aluno outro = new Aluno();
        outro.setNome("Outro estudante"); outro.setMatricula("PLANOAPI002"); outro.setCurso("ADS");
        alunoRepository.save(outro);
        mockMvc.perform(get("/planos-acao/aluno/{id}", outro.getIdAluno()).session(sessao))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"periodoLetivo", "necessidadesEspecificas", "percursoEducacional",
            "principaisDemandas", "propostasIntervencao", "nomeCoordenador"})
    void rejeitaCamposObrigatoriosComEspacos(String campo) throws Exception {
        Map<String, Object> dados = dadosValidos();
        dados.put(campo, "   ");
        rejeitar(dados, 400);
    }

    @ParameterizedTest
    @CsvSource({"possuiComorbidade,comorbidades", "usaMedicacaoContinua,medicacoes",
            "frequentaServicosApoio,servicosApoio", "apresentouDocumentos,documentosComprobatorios"})
    void exigeDescricaoQuandoRespostaSim(String pergunta, String descricao) throws Exception {
        Map<String, Object> dados = dadosValidos();
        dados.put(pergunta, true);
        dados.put(descricao, "   ");
        rejeitar(dados, 400);
    }

    @Test
    void alunoInexistenteRetorna404SemCadastrar() throws Exception {
        Map<String, Object> dados = dadosValidos(); dados.put("idAluno", Long.MAX_VALUE);
        rejeitar(dados, 404);
        mockMvc.perform(get("/planos-acao/aluno/{id}", Long.MAX_VALUE).session(sessao))
                .andExpect(status().isNotFound());
    }

    private void rejeitar(Map<String, Object> dados, int statusEsperado) throws Exception {
        long quantidade = planoRepository.count();
        mockMvc.perform(post("/planos-acao").session(sessao).header("X-CSRF-TOKEN", "csrf-plano")
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados)))
                .andExpect(status().is(statusEsperado));
        assertEquals(quantidade, planoRepository.count());
    }

    @ParameterizedTest
    @ValueSource(strings = {"GET", "POST"})
    void bloqueiaSemSessao(String metodo) throws Exception {
        var requisicao = metodo.equals("GET")
                ? get("/planos-acao/aluno/{id}", aluno.getIdAluno()) : post("/planos-acao");
        mockMvc.perform(requisicao.contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(dadosValidos())))
                .andExpect(status().isUnauthorized());
        assertEquals(0, planoRepository.count());
    }

    @ParameterizedTest
    @ValueSource(strings = {"GET", "POST"})
    void bloqueiaAssistente(String metodo) throws Exception {
        sessao.setAttribute(AuthController.ATTR_USUARIO_PERFIL, "ASSISTENTE");
        var requisicao = metodo.equals("GET")
                ? get("/planos-acao/aluno/{id}", aluno.getIdAluno()) : post("/planos-acao");
        mockMvc.perform(requisicao.session(sessao).header("X-CSRF-TOKEN", "csrf-plano")
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dadosValidos())))
                .andExpect(status().isForbidden());
        assertEquals(0, planoRepository.count());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "token-incorreto"})
    void exigeTokenDeSegurancaParaCadastrar(String token) throws Exception {
        var requisicao = post("/planos-acao").session(sessao)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dadosValidos()));
        if (!token.isEmpty()) requisicao.header("X-CSRF-TOKEN", token);
        mockMvc.perform(requisicao).andExpect(status().isForbidden());
        assertEquals(0, planoRepository.count());
    }

    @Test
    void bloqueiaPerfilAusenteOuDesconhecidoNaConsulta() throws Exception {
        sessao.removeAttribute(AuthController.ATTR_USUARIO_PERFIL);
        mockMvc.perform(get("/planos-acao/aluno/{id}", aluno.getIdAluno()).session(sessao))
                .andExpect(status().isForbidden());
        sessao.setAttribute(AuthController.ATTR_USUARIO_PERFIL, "INVALIDO");
        mockMvc.perform(get("/planos-acao/aluno/{id}", aluno.getIdAluno()).session(sessao))
                .andExpect(status().isForbidden());
    }

    private Map<String, Object> dadosValidos() {
        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("idAluno", aluno.getIdAluno());
        dados.put("periodoLetivo", "2026.2");
        dados.put("possuiComorbidade", false);
        dados.put("usaMedicacaoContinua", false);
        dados.put("frequentaServicosApoio", false);
        dados.put("apresentouDocumentos", false);
        dados.put("necessidadesEspecificas", "Inclusão e apoio\nSegunda linha.");
        dados.put("percursoEducacional", "Avanços no percurso.");
        dados.put("principaisDemandas", "Acessibilidade.");
        dados.put("propostasIntervencao", "Apoio pedagógico.");
        dados.put("nomeCoordenador", "Coordenação de teste");
        dados.put("dataDocumento", "2026-10-19");
        return dados;
    }
}
