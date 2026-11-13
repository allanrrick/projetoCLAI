package com.projetoCLAI.academico;

import com.projetoCLAI.auth.AuthController;
import com.projetoCLAI.auth.PerfilUsuario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CadastroAcademicoIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Test
    void consultaCadastrosVazios() throws Exception {
        for (String caminho : List.of("/academico/cursos", "/academico/disciplinas")) {
            mockMvc.perform(get(caminho).session(sessao(PerfilUsuario.ASSISTENTE)))
                    .andExpect(status().isOk())
                    .andExpect(content().json("[]"));
        }
    }

    @Test
    void cadastraPersisteEListaCursosOrdenados() throws Exception {
        MockHttpSession sessao = sessao(PerfilUsuario.PROFISSIONAL_CLAI);
        mockMvc.perform(post("/academico/cursos").session(sessao)
                        .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"  Engenharia   Civil  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCurso", greaterThan(0)))
                .andExpect(jsonPath("$.nome", is("Engenharia Civil")))
                .andExpect(jsonPath("$", aMapWithSize(2)));
        mockMvc.perform(post("/academico/cursos").session(sessao)
                        .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Computação\"}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/academico/cursos").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", contains("Computação", "Engenharia Civil")));
        assertEquals(2, cursoRepository.count());
    }

    @Test
    void cadastraPersisteEListaDisciplinasSeparadasDosCursos() throws Exception {
        MockHttpSession sessao = sessao(PerfilUsuario.PROFISSIONAL_CLAI);
        Curso curso = new Curso();
        curso.setNome("Algoritmos");
        cursoRepository.saveAndFlush(curso);
        mockMvc.perform(post("/academico/disciplinas").session(sessao)
                        .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"  Algoritmos  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDisciplina", greaterThan(0)))
                .andExpect(jsonPath("$.nome", is("Algoritmos")))
                .andExpect(jsonPath("$", aMapWithSize(2)));
        mockMvc.perform(get("/academico/disciplinas").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nome", contains("Algoritmos")));
        assertEquals(1, disciplinaRepository.count());
    }

    @Test
    void rejeitaNomesAusentesVaziosEApenasEspacos() throws Exception {
        for (String caminho : List.of("/academico/cursos", "/academico/disciplinas")) {
            for (String corpo : List.of("{}", "{\"nome\":null}", "{\"nome\":\"\"}", "{\"nome\":\"   \"}")) {
                mockMvc.perform(post(caminho).session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                                .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                                .contentType(MediaType.APPLICATION_JSON).content(corpo))
                        .andExpect(status().isBadRequest());
            }
        }
        assertEquals(0, cursoRepository.count());
        assertEquals(0, disciplinaRepository.count());
    }

    @Test
    void rejeitaNomesAcimaDoLimite() throws Exception {
        for (String recurso : List.of("cursos", "disciplinas")) {
            int limite = recurso.equals("cursos") ? 100 : 150;
            mockMvc.perform(post("/academico/" + recurso).session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                            .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"nome\":\"" + "A".repeat(limite + 1) + "\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void rejeitaCursosDuplicadosIgnorandoAcentosCaixaEEspacos() throws Exception {
        Curso curso = new Curso();
        curso.setNome("Análise de Sistemas");
        cursoRepository.saveAndFlush(curso);
        mockMvc.perform(post("/academico/cursos").session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                        .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\" analise   DE SISTEMAS \"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail", containsString("Já existe um curso")));
        assertEquals(1, cursoRepository.count());
    }

    @Test
    void rejeitaDisciplinasDuplicadasIgnorandoAcentosCaixaEEspacos() throws Exception {
        Disciplina disciplina = new Disciplina();
        disciplina.setNome("Matemática Aplicada");
        disciplinaRepository.saveAndFlush(disciplina);
        mockMvc.perform(post("/academico/disciplinas").session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                        .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\" matematica   APLICADA \"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail", containsString("Já existe uma disciplina")));
        assertEquals(1, disciplinaRepository.count());
    }

    @Test
    void bancoImpedeCursoDuplicadoSemDependerDaConsultaPrevia() {
        Curso primeiro = new Curso();
        primeiro.setNome("Engenharia Civil");
        cursoRepository.saveAndFlush(primeiro);
        Curso repetido = new Curso();
        repetido.setNome("engenharia civil");
        assertThrows(DataIntegrityViolationException.class, () -> cursoRepository.saveAndFlush(repetido));
    }

    @Test
    void bancoImpedeDisciplinaDuplicadaSemDependerDaConsultaPrevia() {
        Disciplina primeira = new Disciplina();
        primeira.setNome("Álgebra");
        disciplinaRepository.saveAndFlush(primeira);
        Disciplina repetida = new Disciplina();
        repetida.setNome("algebra");
        assertThrows(DataIntegrityViolationException.class, () -> disciplinaRepository.saveAndFlush(repetida));
    }

    @Test
    void exigeSessaoParaConsultaECadastro() throws Exception {
        for (String caminho : List.of("/academico/cursos", "/academico/disciplinas")) {
            mockMvc.perform(get(caminho)).andExpect(status().isUnauthorized());
            mockMvc.perform(post(caminho).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"nome\":\"Teste\"}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void assistenteConsultaMasNaoCadastraMesmoComCsrfValido() throws Exception {
        MockHttpSession sessao = sessao(PerfilUsuario.ASSISTENTE);
        for (String caminho : List.of("/academico/cursos", "/academico/disciplinas")) {
            mockMvc.perform(get(caminho).session(sessao)).andExpect(status().isOk());
            mockMvc.perform(post(caminho).session(sessao)
                            .header(AuthController.CSRF_HEADER_NAME, "csrf-academico")
                            .contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Teste\"}"))
                    .andExpect(status().isForbidden());
        }
        assertEquals(0, cursoRepository.count());
        assertEquals(0, disciplinaRepository.count());
    }

    @Test
    void exigeCsrfValidoParaCadastro() throws Exception {
        for (String caminho : List.of("/academico/cursos", "/academico/disciplinas")) {
            for (String token : List.of("", "outro-token")) {
                mockMvc.perform(post(caminho).session(sessao(PerfilUsuario.PROFISSIONAL_CLAI))
                                .header(AuthController.CSRF_HEADER_NAME, token)
                                .contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Teste\"}"))
                        .andExpect(status().isForbidden());
            }
        }
        assertEquals(0, cursoRepository.count());
        assertEquals(0, disciplinaRepository.count());
    }

    private MockHttpSession sessao(PerfilUsuario perfil) {
        MockHttpSession sessao = new MockHttpSession();
        sessao.setAttribute(AuthController.ATTR_USUARIO_ID, 1L);
        sessao.setAttribute(AuthController.ATTR_USUARIO_NOME, "Pessoa teste");
        sessao.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "academico@example.com");
        sessao.setAttribute(AuthController.ATTR_USUARIO_PERFIL, perfil.name());
        sessao.setAttribute(AuthController.ATTR_CSRF_TOKEN, "csrf-academico");
        return sessao;
    }
}
