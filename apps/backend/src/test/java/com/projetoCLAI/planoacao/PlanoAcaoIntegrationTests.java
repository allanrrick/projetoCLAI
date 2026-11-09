package com.projetoCLAI.planoacao;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.atendimento.FileStorageService;
import com.projetoCLAI.auth.AuthController;
import com.projetoCLAI.auth.PerfilUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanoAcaoIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private PlanoAcaoRepository planoAcaoRepository;

    @MockitoBean
    private FileStorageService fileStorageService;

    private Aluno alunoA;
    private Aluno alunoB;
    private Aluno alunoSemPlanos;

    @BeforeEach
    void prepararDados() {
        alunoA = salvarAluno("PLANO001", "Ana Beatriz Araújo", "Engenharia Civil");
        alunoB = salvarAluno("PLANO002", "Bruno César Brandão", "Análise e Desenvolvimento de Sistemas");
        alunoSemPlanos = salvarAluno("PLANO003", "Carla Dias", "Licenciatura em Matemática");
    }

    @Test
    void ta41RejeitaCamposObrigatoriosVaziosApenasEspacosECondicionaisIncompletos() throws Exception {
        MockHttpSession sessao = sessaoProfissional("Coordenação CLAI");

        // Narrativa obrigatória composta apenas por espaços -> 400
        String payloadEspacos = """
                {
                  "idAluno": %d,
                  "possuiComorbidades": false,
                  "usoMedicacaoContinua": false,
                  "necessidadesEspecificas": "   ",
                  "percursoEducacional": "Percurso inicial",
                  "principaisDemandas": "Demandas iniciais",
                  "propostasIntervencao": "Intervenção inicial",
                  "assinaturaCoordenador": "Coordenação CLAI",
                  "dataDocumento": "2026-10-20"
                }
                """.formatted(alunoA.getIdAluno());

        mockMvc.perform(post("/planos-acao")
                        .session(sessao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadEspacos))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.Erro", containsString("Necessidades específicas")));

        // Condicional possuiComorbidades = true sem descrição -> 400
        String payloadComorbidadeSemTexto = """
                {
                  "idAluno": %d,
                  "possuiComorbidades": true,
                  "comorbidades": "   ",
                  "usoMedicacaoContinua": false,
                  "necessidadesEspecificas": "Necessidades válidas",
                  "percursoEducacional": "Percurso válido",
                  "principaisDemandas": "Demandas válidas",
                  "propostasIntervencao": "Propostas válidas",
                  "assinaturaCoordenador": "Coordenação CLAI",
                  "dataDocumento": "2026-10-20"
                }
                """.formatted(alunoA.getIdAluno());

        mockMvc.perform(post("/planos-acao")
                        .session(sessao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadComorbidadeSemTexto))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.Erro", containsString("comorbidades")));

        // Condicional usoMedicacaoContinua = true sem descrição -> 400
        String payloadMedicacaoSemTexto = """
                {
                  "idAluno": %d,
                  "possuiComorbidades": false,
                  "usoMedicacaoContinua": true,
                  "medicacaoContinua": "",
                  "necessidadesEspecificas": "Necessidades válidas",
                  "percursoEducacional": "Percurso válido",
                  "principaisDemandas": "Demandas válidas",
                  "propostasIntervencao": "Propostas válidas",
                  "assinaturaCoordenador": "Coordenação CLAI",
                  "dataDocumento": "2026-10-20"
                }
                """.formatted(alunoA.getIdAluno());

        mockMvc.perform(post("/planos-acao")
                        .session(sessao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadMedicacaoSemTexto))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.Erro", containsString("medicação")));

        assertEquals(0, planoAcaoRepository.count());
    }

    @Test
    void ta42CadastraPersisteSeparaPorAlunoEImpedeFalsificacaoDeAutor() throws Exception {
        MockHttpSession sessao = sessaoProfissional("Dra. Lúcia Magalhães");

        String payloadAlunoA = """
                {
                  "idAluno": %d,
                  "responsavelNome": "Maria Araújo",
                  "responsavelParentesco": "Mãe",
                  "responsavelContato": "(83) 99999-0001",
                  "possuiComorbidades": true,
                  "comorbidades": "Baixa visão bilateral com fotofobia",
                  "usoMedicacaoContinua": true,
                  "medicacaoContinua": "Colírio lubrificante de uso contínuo",
                  "servicosApoio": "Atendimento educacional especializado e ledor",
                  "documentosComprobatorios": "Laudo oftalmológico atualizado",
                  "necessidadesEspecificas": "Ampliação de provas (fonte 18)\\nContraste elevado nos materiais.",
                  "percursoEducacional": "Ótimo desempenho em cálculo e participação ativa em laboratório.",
                  "principaisDemandas": "Adaptação de materiais gráficos e tempo adicional em avaliações.",
                  "propostasIntervencao": "Envio antecipado de apostilas digitais acessíveis.",
                  "assinaturaCoordenador": "Coordenação Local CLAI - Campus Cajazeiras",
                  "dataDocumento": "2026-10-20",
                  "autor": "Tentativa de Falsificação"
                }
                """.formatted(alunoA.getIdAluno());

        mockMvc.perform(post("/planos-acao")
                        .session(sessao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadAlunoA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPlano", notNullValue()))
                .andExpect(jsonPath("$.idAluno").value(alunoA.getIdAluno()))
                .andExpect(jsonPath("$.autor").value("Dra. Lúcia Magalhães"))
                .andExpect(jsonPath("$.criadoEm", notNullValue()))
                .andExpect(jsonPath("$.necessidadesEspecificas").value(
                        "Ampliação de provas (fonte 18)\nContraste elevado nos materiais."));

        String payloadAlunoB = """
                {
                  "idAluno": %d,
                  "possuiComorbidades": false,
                  "usoMedicacaoContinua": false,
                  "necessidadesEspecificas": "Acompanhamento pedagógico quinzenal.",
                  "percursoEducacional": "Evolução na organização de entregas.",
                  "principaisDemandas": "Planejamento de rotina de estudos.",
                  "propostasIntervencao": "Tutoria acadêmica semanal.",
                  "assinaturaCoordenador": "Coordenação Local CLAI",
                  "dataDocumento": "2026-10-21"
                }
                """.formatted(alunoB.getIdAluno());

        mockMvc.perform(post("/planos-acao")
                        .session(sessao)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadAlunoB))
                .andExpect(status().isCreated());

        // Consulta do alunoA retorna somente o plano do alunoA
        mockMvc.perform(get("/planos-acao/aluno/{id}", alunoA.getIdAluno()).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].idAluno").value(alunoA.getIdAluno()))
                .andExpect(jsonPath("$[0].comorbidades").value("Baixa visão bilateral com fotofobia"))
                .andExpect(jsonPath("$[0].autor").value("Dra. Lúcia Magalhães"));

        // Consulta de aluno sem planos retorna lista vazia
        mockMvc.perform(get("/planos-acao/aluno/{id}", alunoSemPlanos.getIdAluno()).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Aluno inexistente retorna 404
        mockMvc.perform(get("/planos-acao/aluno/999999").session(sessao))
                .andExpect(status().isNotFound());
    }

    @Test
    void restringePlanosDeAcaoAAutenticadosEProfissionaisAutorizados() throws Exception {
        String payload = """
                {
                  "idAluno": %d,
                  "possuiComorbidades": false,
                  "usoMedicacaoContinua": false,
                  "necessidadesEspecificas": "Necessidades",
                  "percursoEducacional": "Percurso",
                  "principaisDemandas": "Demandas",
                  "propostasIntervencao": "Propostas",
                  "assinaturaCoordenador": "Coordenação",
                  "dataDocumento": "2026-10-20"
                }
                """.formatted(alunoA.getIdAluno());

        // Sem sessão -> 401
        mockMvc.perform(get("/planos-acao/aluno/{id}", alunoA.getIdAluno()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/planos-acao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());

        // Perfil ASSISTENTE -> 403 em GET e POST de planos-acao
        MockHttpSession sessaoAssistente = new MockHttpSession();
        sessaoAssistente.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "assistente@ifpb.edu.br");
        sessaoAssistente.setAttribute(AuthController.ATTR_USUARIO_NOME, "Assistente Consulta");
        sessaoAssistente.setAttribute(AuthController.ATTR_USUARIO_PERFIL, PerfilUsuario.ASSISTENTE.name());

        mockMvc.perform(get("/planos-acao/aluno/{id}", alunoA.getIdAluno()).session(sessaoAssistente))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/planos-acao")
                        .session(sessaoAssistente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());

        assertEquals(0, planoAcaoRepository.count());
    }

    private Aluno salvarAluno(String matricula, String nome, String curso) {
        Aluno novo = new Aluno();
        novo.setMatricula(matricula);
        novo.setNome(nome);
        novo.setCurso(curso);
        novo.setAtivo(true);
        return alunoRepository.save(novo);
    }

    private MockHttpSession sessaoProfissional(String nome) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "prof@ifpb.edu.br");
        session.setAttribute(AuthController.ATTR_USUARIO_NOME, nome);
        session.setAttribute(AuthController.ATTR_USUARIO_PERFIL, PerfilUsuario.PROFISSIONAL_CLAI.name());
        return session;
    }
}
