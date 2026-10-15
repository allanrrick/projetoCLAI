package com.projetoCLAI.aluno;

import com.projetoCLAI.aluno.alunoDTO.CadastrarAlunoDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    private final AlunoRepository alunoRepository;

    public AlunoController(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @PostMapping
    public ResponseEntity<?> criar(
            @Valid @RequestBody CadastrarAlunoDTO request) {

        if (alunoRepository.existsByMatricula(
                request.matricula())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro",
                            "Aluno já cadastrado"
                    ));
        }

        if (request.email() != null
                && !request.email().isBlank()
                && alunoRepository.existsByEmail(
                request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "Erro",
                            "Aluno já cadastrado"
                    ));
        }

        Aluno aluno = new Aluno();
        aluno.setMatricula(request.matricula());
        aluno.setNome(request.nome());
        aluno.setEmail(
                request.email());
        aluno.setCurso(request.curso());

        Aluno salvo = alunoRepository.save(aluno);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(salvo);
    }
}
