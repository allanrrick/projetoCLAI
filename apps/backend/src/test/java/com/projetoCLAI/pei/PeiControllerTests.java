package com.projetoCLAI.pei;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PeiControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private PeiRepository peiRepository;

    private Aluno aluno;

    @BeforeEach
    void preparar() {
        peiRepository.deleteAll();
        aluno = new Aluno();
        aluno.setMatricula("PEI001");
        aluno.setNome("Aluno com PEI");
        aluno.setCurso("ADS");
        aluno = alunoRepository.save(aluno);
    }

    @Test
    void cadastraEConsultaPeisVinculadosAoAluno() throws Exception {
        mockMvc.perform(post("/peis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                        .content("""
                                {
                                  "matricula":"PEI001",
                                  "necessidadesEspecificas":"Necessita acompanhamento em leitura.",
                                  "objetivos":"Ampliar compreensão textual.",
                                  "estrategiasAcompanhamento":"Monitorias semanais com adaptações."
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.idAluno").value(aluno.getIdAluno()))
                .andExpect(jsonPath("$.matricula").value("PEI001"))
                .andExpect(jsonPath("$.necessidadesEspecificas").value("Necessita acompanhamento em leitura."))
                .andExpect(jsonPath("$.objetivos").value("Ampliar compreensão textual."))
                .andExpect(jsonPath("$.estrategiasAcompanhamento").value("Monitorias semanais com adaptações."));

        mockMvc.perform(get("/peis/{matricula}", "PEI001")
                        .session(sessao(PerfilUsuario.PROFISSIONAL_CLAI)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].matricula").value("PEI001"))
                .andExpect(jsonPath("$[0].necessidadesEspecificas").value("Necessita acompanhamento em leitura."))
                .andExpect(jsonPath("$[0].objetivos").value("Ampliar compreensão textual."))
                .andExpect(jsonPath("$[0].estrategiasAcompanhamento").value("Monitorias semanais com adaptações."));
    }

    @Test
    void rejeitaCamposObrigatoriosEmBranco() throws Exception {
        mockMvc.perform(post("/peis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                        .content("""
                                {
                                  "matricula":"PEI001",
                                  "necessidadesEspecificas":" ",
                                  "objetivos":" ",
                                  "estrategiasAcompanhamento":" "
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void bloqueiaPerfilSemPermissaoParaPei() throws Exception {
        mockMvc.perform(post("/peis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .session(sessao(PerfilUsuario.ASSISTENTE))
                        .content("""
                                {
                                  "matricula":"PEI001",
                                  "necessidadesEspecificas":"Necessidade.",
                                  "objetivos":"Objetivo.",
                                  "estrategiasAcompanhamento":"Estratégia."
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/peis/{matricula}", "PEI001")
                        .session(sessao(PerfilUsuario.ASSISTENTE)))
                .andExpect(status().isForbidden());
    }

    private MockHttpSession sessao(PerfilUsuario perfil) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "pei@example.com");
        session.setAttribute(AuthController.ATTR_USUARIO_PERFIL, perfil.name());
        return session;
    }
}
