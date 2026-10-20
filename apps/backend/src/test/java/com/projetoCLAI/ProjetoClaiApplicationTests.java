package com.projetoCLAI;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.atendimento.Atendimento;
import com.projetoCLAI.atendimento.AtendimentoController;
import com.projetoCLAI.atendimento.AtendimentoRepository;
import com.projetoCLAI.atendimento.AtendimentoService;
import com.projetoCLAI.atendimento.FileStorageService;
import com.projetoCLAI.atendimento.atendimentoDTO.AtendimentoResponseDTO;
import com.projetoCLAI.atendimento.atendimentoDTO.CadastroAtendimentoDTO;
import com.projetoCLAI.auth.*;
import com.projetoCLAI.auth.authDTO.CadastrarUsuarioDTO;
import com.projetoCLAI.auth.authDTO.LoginDTO;
import com.projetoCLAI.auth.authDTO.SessaoDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ProjetoClaiApplicationTests {

    @Test
    void senhaHasherGeraSaltEValidaCredenciais() {
        String hash = SenhaHasher.hash("senhaSegura123");
        assertNotNull(hash);
        assertTrue(hash.contains(":"));
        assertTrue(SenhaHasher.verificar("senhaSegura123", hash));
        assertFalse(SenhaHasher.verificar("senhaIncorreta", hash));
    }

    @Test
    void authControllerCadastraAutenticaEValidaSessao() {
        UsuarioRepository repo = Mockito.mock(UsuarioRepository.class);
        when(repo.existsByEmailIgnoreCase("prof@ifpb.edu.br")).thenReturn(false);
        when(repo.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthController controller = new AuthController(repo);
        MockHttpServletRequest reqCadastro = new MockHttpServletRequest();

        ResponseEntity<?> respCadastro = controller.cadastrar(
                new CadastrarUsuarioDTO("Profissional CLAI", "prof@ifpb.edu.br", "123456", "PROFISSIONAL_CLAI"),
                reqCadastro
        );
        assertEquals(HttpStatus.CREATED, respCadastro.getStatusCode());
        SessaoDTO sessao = (SessaoDTO) respCadastro.getBody();
        assertNotNull(sessao);
        assertEquals("Profissional CLAI", sessao.nome());
        assertTrue(sessao.permissoes().contains("atendimentos:cadastrar"));

        // Duplicidade retorna 409
        when(repo.existsByEmailIgnoreCase("prof@ifpb.edu.br")).thenReturn(true);
        ResponseEntity<?> respDuplicado = controller.cadastrar(
                new CadastrarUsuarioDTO("Outro", "prof@ifpb.edu.br", "123456", "PROFISSIONAL_CLAI"),
                new MockHttpServletRequest()
        );
        assertEquals(HttpStatus.CONFLICT, respDuplicado.getStatusCode());

        // Login válido e inválido
        Usuario salvo = new Usuario("Profissional CLAI", "prof@ifpb.edu.br", SenhaHasher.hash("123456"), "PROFISSIONAL_CLAI");
        when(repo.findByEmailIgnoreCase("prof@ifpb.edu.br")).thenReturn(Optional.of(salvo));

        ResponseEntity<?> loginInvalido = controller.login(
                new LoginDTO("prof@ifpb.edu.br", "errada"),
                new MockHttpServletRequest()
        );
        assertEquals(HttpStatus.UNAUTHORIZED, loginInvalido.getStatusCode());

        ResponseEntity<?> loginValido = controller.login(
                new LoginDTO("prof@ifpb.edu.br", "123456"),
                new MockHttpServletRequest()
        );
        assertEquals(HttpStatus.OK, loginValido.getStatusCode());
    }

    @Test
    void autorizacaoInterceptorRestringeAtendimentosAUsuariosAutorizados() throws Exception {
        AutorizacaoInterceptor interceptor = new AutorizacaoInterceptor();

        // Sem sessão -> 401
        MockHttpServletRequest reqAnon = new MockHttpServletRequest("GET", "/atendimentos/2026001");
        MockHttpServletResponse resAnon = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(reqAnon, resAnon, new Object()));
        assertEquals(401, resAnon.getStatus());

        // Perfil ASSISTENTE tentando registrar atendimento -> 403
        MockHttpServletRequest reqAssistente = new MockHttpServletRequest("POST", "/atendimentos");
        MockHttpSession sessionAssistente = new MockHttpSession();
        sessionAssistente.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "consulta@ifpb.edu.br");
        sessionAssistente.setAttribute(AuthController.ATTR_USUARIO_PERFIL, "ASSISTENTE");
        reqAssistente.setSession(sessionAssistente);
        MockHttpServletResponse resAssistente = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(reqAssistente, resAssistente, new Object()));
        assertEquals(403, resAssistente.getStatus());

        // Perfil PROFISSIONAL_CLAI registrando atendimento -> permitido
        MockHttpServletRequest reqProf = new MockHttpServletRequest("POST", "/atendimentos");
        MockHttpSession sessionProf = new MockHttpSession();
        sessionProf.setAttribute(AuthController.ATTR_USUARIO_EMAIL, "prof@ifpb.edu.br");
        sessionProf.setAttribute(AuthController.ATTR_USUARIO_PERFIL, "PROFISSIONAL_CLAI");
        reqProf.setSession(sessionProf);
        MockHttpServletResponse resProf = new MockHttpServletResponse();
        assertTrue(interceptor.preHandle(reqProf, resProf, new Object()));
    }

    @Test
    void atendimentoControllerRegistraEConsultaPorMatricula() {
        AtendimentoRepository atendimentoRepo = Mockito.mock(AtendimentoRepository.class);
        AlunoRepository alunoRepo = Mockito.mock(AlunoRepository.class);
        FileStorageService storage = Mockito.mock(FileStorageService.class);

        Aluno aluno = new Aluno();
        aluno.setMatricula("2026001");
        aluno.setNome("Estudante CLAI");
        aluno.setCurso("ADS");

        when(alunoRepo.existsByMatricula("2026001")).thenReturn(true);
        when(alunoRepo.findByMatricula("2026001")).thenReturn(aluno);
        when(atendimentoRepo.save(any(Atendimento.class))).thenAnswer(inv -> inv.getArgument(0));

        AtendimentoController controller = new AtendimentoController(
                atendimentoRepo, alunoRepo, storage, new AtendimentoService(atendimentoRepo));
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(AuthController.ATTR_USUARIO_NOME, "Coordenação CLAI");
        req.setSession(session);

        ResponseEntity<AtendimentoResponseDTO> criado = controller.registrarAtendimento(
                new CadastroAtendimentoDTO("2026001", "2026-10-18", "10:00", "Acompanhamento inicial", null),
                req
        );
        assertEquals(HttpStatus.CREATED, criado.getStatusCode());
        assertNotNull(criado.getBody());
        assertEquals("Coordenação CLAI", criado.getBody().profissional());

        // Aluno inexistente deve lançar 404
        when(alunoRepo.existsByMatricula("INEXISTENTE")).thenReturn(false);
        assertThrows(ResponseStatusException.class, () ->
                controller.registrarAtendimento(
                        new CadastroAtendimentoDTO("INEXISTENTE", "2026-10-18", "10:00", "Obs", null),
                        req
                )
        );
    }
}
