package com.projetoCLAI.auth;

import com.projetoCLAI.auth.authDTO.CadastrarUsuarioDTO;
import com.projetoCLAI.auth.authDTO.LoginDTO;
import com.projetoCLAI.auth.authDTO.SessaoDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    public static final String ATTR_USUARIO_ID = "CLAI_USUARIO_ID";
    public static final String ATTR_USUARIO_NOME = "CLAI_USUARIO_NOME";
    public static final String ATTR_USUARIO_EMAIL = "CLAI_USUARIO_EMAIL";
    public static final String ATTR_USUARIO_PERFIL = "CLAI_USUARIO_PERFIL";
    public static final String ATTR_CSRF_TOKEN = "CLAI_CSRF_TOKEN";
    public static final String CSRF_HEADER_NAME = "X-CSRF-TOKEN";

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(
            @Valid @RequestBody CadastrarUsuarioDTO dto,
            HttpServletRequest request) {

        String nome = dto.nome().trim();
        String email = dto.email().trim().toLowerCase();

        if (nome.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Erro", "O nome é obrigatório."));
        }

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("Erro", "Já existe um usuário com este e-mail."));
        }

        PerfilUsuario perfil = PerfilUsuario.fromString(dto.perfil());
        Usuario novoUsuario = new Usuario(
                nome,
                email,
                SenhaHasher.hash(dto.senha()),
                perfil.name()
        );

        Usuario salvo = usuarioRepository.save(novoUsuario);
        SessaoDTO sessao = iniciarSessao(request.getSession(true), salvo);

        return ResponseEntity.status(HttpStatus.CREATED).body(sessao);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginDTO dto,
            HttpServletRequest request) {

        String email = dto.email().trim().toLowerCase();
        Optional<Usuario> encontrado = usuarioRepository.findByEmailIgnoreCase(email);

        if (encontrado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("Erro", "E-mail ou senha inválidos."));
        }

        Usuario usuario = encontrado.get();
        if (!Boolean.TRUE.equals(usuario.getAtivo())
                || !SenhaHasher.verificar(dto.senha(), usuario.getSenhaHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("Erro", "E-mail ou senha inválidos."));
        }

        SessaoDTO sessao = iniciarSessao(request.getSession(true), usuario);
        return ResponseEntity.ok(sessao);
    }

    @GetMapping("/sessao")
    public ResponseEntity<?> sessao(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("Erro", "Sua sessão não está ativa. Entre para continuar."));
        }

        String nome = (String) session.getAttribute(ATTR_USUARIO_NOME);
        String email = (String) session.getAttribute(ATTR_USUARIO_EMAIL);
        String perfilStr = (String) session.getAttribute(ATTR_USUARIO_PERFIL);
        String csrfToken = (String) session.getAttribute(ATTR_CSRF_TOKEN);

        if (nome == null || email == null || perfilStr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("Erro", "Sua sessão não está ativa. Entre para continuar."));
        }

        if (csrfToken == null) {
            csrfToken = UUID.randomUUID().toString();
            session.setAttribute(ATTR_CSRF_TOKEN, csrfToken);
        }

        PerfilUsuario perfil = PerfilUsuario.fromString(perfilStr);
        return ResponseEntity.ok(new SessaoDTO(
                nome,
                email,
                perfil.name(),
                perfil.getPermissoes(),
                csrfToken,
                CSRF_HEADER_NAME
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    private SessaoDTO iniciarSessao(HttpSession session, Usuario usuario) {
        PerfilUsuario perfil = PerfilUsuario.fromString(usuario.getPerfil());
        String csrfToken = UUID.randomUUID().toString();
        session.setAttribute(ATTR_USUARIO_ID, usuario.getIdUsuario());
        session.setAttribute(ATTR_USUARIO_NOME, usuario.getNome());
        session.setAttribute(ATTR_USUARIO_EMAIL, usuario.getEmail());
        session.setAttribute(ATTR_USUARIO_PERFIL, perfil.name());
        session.setAttribute(ATTR_CSRF_TOKEN, csrfToken);

        return new SessaoDTO(
                usuario.getNome(),
                usuario.getEmail(),
                perfil.name(),
                perfil.getPermissoes(),
                csrfToken,
                CSRF_HEADER_NAME
        );
    }
}

