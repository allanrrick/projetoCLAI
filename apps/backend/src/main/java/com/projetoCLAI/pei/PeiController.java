package com.projetoCLAI.pei;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.pei.peiDTO.CadastroPeiDTO;
import com.projetoCLAI.pei.peiDTO.PeiResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/peis")
@RequiredArgsConstructor
public class PeiController {

    private final PeiRepository peiRepository;
    private final AlunoRepository alunoRepository;

    @PostMapping
    public ResponseEntity<PeiResponseDTO> cadastrar(@Valid @RequestBody CadastroPeiDTO dto) {
        Aluno aluno = alunoRepository.findByMatricula(dto.matricula());
        if (aluno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Aluno não encontrado com a matrícula: " + dto.matricula());
        }

        Pei pei = new Pei(
                dto.necessidadesEspecificas().trim(),
                dto.objetivos().trim(),
                dto.estrategiasAcompanhamento().trim(),
                aluno
        );
        Pei salvo = peiRepository.save(pei);
        return ResponseEntity.status(HttpStatus.CREATED).body(new PeiResponseDTO(salvo));
    }

    @GetMapping("/{matricula}")
    public ResponseEntity<List<PeiResponseDTO>> listarPorMatricula(@PathVariable String matricula) {
        if (!alunoRepository.existsByMatricula(matricula)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Aluno não encontrado com a matrícula: " + matricula);
        }
        List<PeiResponseDTO> peis = peiRepository.findByAlunoMatriculaOrderByIdPeiDesc(matricula)
                .stream()
                .map(PeiResponseDTO::new)
                .toList();
        return ResponseEntity.ok(peis);
    }
}
