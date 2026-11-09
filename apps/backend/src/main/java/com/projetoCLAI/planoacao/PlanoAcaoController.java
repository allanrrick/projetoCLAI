package com.projetoCLAI.planoacao;

import com.projetoCLAI.auth.AuthController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/planos-acao")
public class PlanoAcaoController {

    private final PlanoAcaoService planoAcaoService;

    public PlanoAcaoController(PlanoAcaoService planoAcaoService) {
        this.planoAcaoService = planoAcaoService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(
            @RequestBody(required = false) CriarPlanoAcaoDTO dto,
            HttpServletRequest request) {

        String erroValidacao = planoAcaoService.validar(dto);
        if (erroValidacao != null) {
            return ResponseEntity.badRequest().body(Map.of("Erro", erroValidacao));
        }

        HttpSession session = request.getSession(false);
        String autorSessao = session != null
                ? (String) session.getAttribute(AuthController.ATTR_USUARIO_NOME)
                : null;

        Optional<PlanoAcaoResponseDTO> criado = planoAcaoService.cadastrar(dto, autorSessao);
        if (criado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("Erro", "Aluno não encontrado."));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(criado.get());
    }

    @GetMapping("/aluno/{idAluno}")
    public ResponseEntity<?> listarPorAluno(@PathVariable Long idAluno) {
        Optional<List<PlanoAcaoResponseDTO>> planos = planoAcaoService.listarPorAluno(idAluno);
        if (planos.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("Erro", "Aluno não encontrado."));
        }
        return ResponseEntity.ok(planos.get());
    }
}
