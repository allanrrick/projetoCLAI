package com.projetoCLAI.academico;

import com.projetoCLAI.academico.academicoDTO.CadastrarCursoDTO;
import com.projetoCLAI.academico.academicoDTO.CadastrarDisciplinaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/academico")
public class CadastroAcademicoController {

    private final CadastroAcademicoService cadastroAcademicoService;

    public CadastroAcademicoController(CadastroAcademicoService cadastroAcademicoService) {
        this.cadastroAcademicoService = cadastroAcademicoService;
    }

    @GetMapping("/cursos")
    public ResponseEntity<List<Curso>> listarCursos() {
        return ResponseEntity.ok(cadastroAcademicoService.listarCursos());
    }

    @PostMapping("/cursos")
    public ResponseEntity<Curso> cadastrarCurso(@Valid @RequestBody CadastrarCursoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cadastroAcademicoService.cadastrarCurso(dto.nome()));
    }

    @GetMapping("/disciplinas")
    public ResponseEntity<List<Disciplina>> listarDisciplinas() {
        return ResponseEntity.ok(cadastroAcademicoService.listarDisciplinas());
    }

    @PostMapping("/disciplinas")
    public ResponseEntity<Disciplina> cadastrarDisciplina(@Valid @RequestBody CadastrarDisciplinaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cadastroAcademicoService.cadastrarDisciplina(dto.nome()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> tratarErro(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(exception.getBody());
    }
}
