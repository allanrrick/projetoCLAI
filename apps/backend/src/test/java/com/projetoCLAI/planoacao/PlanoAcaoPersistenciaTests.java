package com.projetoCLAI.planoacao;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.atendimento.Atendimento;
import com.projetoCLAI.atendimento.FileStorageService;
import com.projetoCLAI.auth.AuthController;
import com.projetoCLAI.auth.PerfilUsuario;
import com.projetoCLAI.auth.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanoAcaoPersistenciaTests {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileStorageService fileStorageService;

    private Aluno aluno;
    private Usuario autor;

    @BeforeEach
    void prepararCadastros() {
        aluno = salvarAluno("PLANO001", "Ana Inclusão");
        autor = new Usuario("Autor do plano", "plano-autor@example.com",
                "hash-de-teste", PerfilUsuario.PROFISSIONAL_CLAI.name());
        entityManager.persist(autor);
    }

    @Test
    void salvaERecuperaOsCamposDoModeloComTextosLongosEAcentuacao() {
        String texto = "Acompanhamento da inclusão e adaptação às atividades.\n".repeat(100);
        PlanoAcao plano = novoPlano(aluno);
        plano.setPeriodoLetivo("2026.2");
        plano.setPeriodoIngresso("2025.1");
        plano.setDataNascimento(LocalDate.of(2004, 4, 15));
        plano.setTelefoneAluno("(83) 90000-0000");
        plano.setNomeResponsavel("Maria Inclusão");
        plano.setParentescoResponsavel("Mãe");
        plano.setTelefoneResponsavel("(83) 90000-0001");
        plano.setEmailResponsavel("responsavel@example.com");
        plano.setPossuiComorbidade(true);
        plano.setComorbidades("Descrição de comorbidades para teste.");
        plano.setUsaMedicacaoContinua(true);
        plano.setMedicacoes("Descrição de medicação para teste.");
        plano.setFrequentaServicosApoio(true);
        plano.setServicosApoio("Serviço de apoio para teste.");
        plano.setApresentouDocumentos(true);
        plano.setDocumentosComprobatorios("Relatório apresentado para teste.");
        plano.setNecessidadesEspecificas("Necessidades: " + texto);
        plano.setPercursoEducacional("Percurso: " + texto);
        plano.setPrincipaisDemandas("Demandas: " + texto);
        plano.setPropostasIntervencao("Intervenções: " + texto);
        plano.setNomeCoordenador("Coordenação CLAI");
        plano.setDataDocumento(LocalDate.of(2026, 10, 19));

        entityManager.persist(plano);
        entityManager.flush();
        entityManager.clear();

        PlanoAcao salvo = entityManager.find(PlanoAcao.class, plano.getIdPlanoAcao());
        assertNotNull(salvo.getIdPlanoAcao());
        assertEquals(aluno.getIdAluno(), salvo.getAluno().getIdAluno());
        assertEquals(autor.getIdUsuario(), salvo.getAutor().getIdUsuario());
        assertNotNull(salvo.getDataCriacao());
        assertEquals("2026.2", salvo.getPeriodoLetivo());
        assertEquals("2025.1", salvo.getPeriodoIngresso());
        assertEquals(LocalDate.of(2004, 4, 15), salvo.getDataNascimento());
        assertEquals("(83) 90000-0000", salvo.getTelefoneAluno());
        assertEquals("Maria Inclusão", salvo.getNomeResponsavel());
        assertEquals("Mãe", salvo.getParentescoResponsavel());
        assertEquals("(83) 90000-0001", salvo.getTelefoneResponsavel());
        assertEquals("responsavel@example.com", salvo.getEmailResponsavel());
        assertTrue(salvo.getPossuiComorbidade());
        assertEquals(plano.getComorbidades(), salvo.getComorbidades());
        assertTrue(salvo.getUsaMedicacaoContinua());
        assertEquals(plano.getMedicacoes(), salvo.getMedicacoes());
        assertTrue(salvo.getFrequentaServicosApoio());
        assertEquals(plano.getServicosApoio(), salvo.getServicosApoio());
        assertTrue(salvo.getApresentouDocumentos());
        assertEquals(plano.getDocumentosComprobatorios(), salvo.getDocumentosComprobatorios());
        assertEquals("Necessidades: " + texto, salvo.getNecessidadesEspecificas());
        assertEquals("Percurso: " + texto, salvo.getPercursoEducacional());
        assertEquals("Demandas: " + texto, salvo.getPrincipaisDemandas());
        assertEquals("Intervenções: " + texto, salvo.getPropostasIntervencao());
        assertEquals("Coordenação CLAI", salvo.getNomeCoordenador());
        assertEquals(LocalDate.of(2026, 10, 19), salvo.getDataDocumento());
    }

    @Test
    void permiteMaisDeUmPlanoPorAlunoSemMisturarOsAlunos() {
        Aluno outroAluno = salvarAluno("PLANO002", "Bruno Santos");
        PlanoAcao primeiro = novoPlano(aluno);
        PlanoAcao segundo = novoPlano(aluno);
        entityManager.persist(primeiro);
        entityManager.persist(segundo);
        entityManager.persist(novoPlano(outroAluno));
        entityManager.flush();
        entityManager.clear();

        List<PlanoAcao> planos = entityManager.createQuery(
                "select p from PlanoAcao p where p.aluno.idAluno = :idAluno order by p.idPlanoAcao",
                PlanoAcao.class).setParameter("idAluno", aluno.getIdAluno()).getResultList();

        assertEquals(2, planos.size());
        assertEquals(primeiro.getIdPlanoAcao(), planos.get(0).getIdPlanoAcao());
        assertEquals(segundo.getIdPlanoAcao(), planos.get(1).getIdPlanoAcao());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "aluno_id = null", "autor_id = null", "data_criacao = null",
            "aluno_id = -1", "autor_id = -1"
    })
    void bancoRejeitaVinculosInvalidosECamposObrigatoriosAusentes(String alteracao) {
        PlanoAcao plano = novoPlano(aluno);
        entityManager.persist(plano);
        entityManager.flush();

        assertThrows(PersistenceException.class, () -> entityManager.createNativeQuery(
                "update public.planos_acao set " + alteracao + " where id_plano_acao = :id")
                .setParameter("id", plano.getIdPlanoAcao()).executeUpdate());
    }

    @Test
    void salvarPlanoPreservaAlunoUsuarioEAtendimentoExistentes() {
        Atendimento atendimento = new Atendimento("2026-10-19", "10:00",
                "Atendimento já cadastrado", null, aluno);
        entityManager.persist(atendimento);
        entityManager.persist(novoPlano(aluno));
        entityManager.flush();
        entityManager.clear();

        Aluno alunoSalvo = entityManager.find(Aluno.class, aluno.getIdAluno());
        Usuario autorSalvo = entityManager.find(Usuario.class, autor.getIdUsuario());
        Atendimento atendimentoSalvo = entityManager.find(Atendimento.class, atendimento.getId());
        assertEquals("PLANO001", alunoSalvo.getMatricula());
        assertEquals("Ana Inclusão", alunoSalvo.getNome());
        assertEquals("ADS", alunoSalvo.getCurso());
        assertEquals("plano-autor@example.com", autorSalvo.getEmail());
        assertEquals("hash-de-teste", autorSalvo.getSenhaHash());
        assertEquals("Atendimento já cadastrado", atendimentoSalvo.getObservacoes());
    }

    @Test
    void consultaDeAlunosDoAssistenteNaoExpoeOPlano() throws Exception {
        PlanoAcao plano = novoPlano(aluno);
        plano.setNecessidadesEspecificas("PLANO-PRIVADO-37");
        entityManager.persist(plano);
        entityManager.flush();
        entityManager.clear();

        MockHttpSession sessao = new MockHttpSession();
        sessao.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "assistente@example.com");
        sessao.setAttribute(AuthController.ATTR_USUARIO_PERFIL, PerfilUsuario.ASSISTENTE.name());

        mockMvc.perform(get("/alunos/{id}", aluno.getIdAluno()).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idAluno").value(aluno.getIdAluno().intValue()))
                .andExpect(jsonPath("$.planosAcao").doesNotExist())
                .andExpect(content().string(not(containsString("PLANO-PRIVADO-37"))));
        mockMvc.perform(get("/alunos").session(sessao))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("PLANO-PRIVADO-37"))));
    }

    private Aluno salvarAluno(String matricula, String nome) {
        Aluno novoAluno = new Aluno();
        novoAluno.setMatricula(matricula);
        novoAluno.setNome(nome);
        novoAluno.setCurso("ADS");
        entityManager.persist(novoAluno);
        return novoAluno;
    }

    private PlanoAcao novoPlano(Aluno estudante) {
        PlanoAcao plano = new PlanoAcao();
        plano.setAluno(estudante);
        plano.setAutor(autor);
        return plano;
    }
}
