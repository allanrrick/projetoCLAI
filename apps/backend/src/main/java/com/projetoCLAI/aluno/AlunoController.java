
package com.projetoCLAI.aluno;

import com.projetoCLAI.aluno.alunoDTO.CadastrarAlunoDTO;
import com.projetoCLAI.aluno.alunoDTO.AtualizarAlunoDTO;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    private final AlunoRepository alunoRepository;

    public AlunoController(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    // Cadastrar aluno
    @PostMapping
    public ResponseEntity<?> criar(
            @Valid @RequestBody CadastrarAlunoDTO request) {

        if (alunoRepository.existsByMatricula(
                request.matricula())) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro", "Aluno já cadastrado"
                    ));
        }

        if (request.email() != null
                && !request.email().isBlank()
                && alunoRepository.existsByEmail(request.email())) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro", "Aluno já cadastrado"
                    ));
        }

        Aluno aluno = new Aluno();

        aluno.setMatricula(request.matricula());
        aluno.setNome(request.nome());
        aluno.setEmail(request.email());
        aluno.setCurso(request.curso());

        Aluno salvo = alunoRepository.save(aluno);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(salvo);
    }

    // Listar todos os alunos
    @GetMapping
    public ResponseEntity<List<Aluno>> listarTodos() {

        List<Aluno> alunos = alunoRepository.findAll();

        return ResponseEntity.ok(alunos);
    }

    // Consultar aluno por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> consultarPorId(
            @PathVariable Long id) {

        return alunoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "Erro", "Aluno não encontrado",
                                "id", id
                        )));
    }

    // Editar aluno
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarAlunoDTO request) {

        // Verificar se o aluno existe
        Aluno aluno = alunoRepository.findById(id)
                .orElse(null);

        if (aluno == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "Erro", "Aluno não encontrado",
                            "id", id
                    ));
        }

        // Verificar duplicidade de matrícula
        if (alunoRepository.existsByMatriculaAndIdAlunoNot(
                request.matricula(), id)) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro", "Matrícula já cadastrada para outro aluno"
                    ));
        }

        // Normalizar e verificar e-mail
        String email = request.email();

        if (email != null && email.isBlank()) {
            email = null;
        }

        if (email != null
                && alunoRepository.existsByEmailAndIdAlunoNot(
                email, id)) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro", "E-mail já cadastrado para outro aluno"
                    ));
        }

        // Atualizar os dados
        aluno.setMatricula(request.matricula());
        aluno.setNome(request.nome());
        aluno.setEmail(email);
        aluno.setCurso(request.curso());

        Aluno atualizado = alunoRepository.save(aluno);

        return ResponseEntity.ok(atualizado);
    }
}
