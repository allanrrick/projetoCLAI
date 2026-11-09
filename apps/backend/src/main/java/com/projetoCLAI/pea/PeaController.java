package com.projetoCLAI.pea;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/aluno/{matricula}/pea")
public class PeaController {

    private final PeaService peaService;

    public PeaController(PeaService peaService) {
        this.peaService = peaService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(
            @RequestBody @Valid CadastrarPeaDTO dto,
            BindingResult result,
            @PathVariable String matricula
    ) {
        if (result.hasErrors()) {
            String msgErro = result.getFieldErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("Erro", msgErro));
        }
        Pea criado = peaService.cadastrar(dto, matricula);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping
    public ResponseEntity<List<Pea>> buscar(
            @PathVariable String matricula,
            @RequestParam(required = false) String disciplina
    ) {
        return ResponseEntity.ok(peaService.buscar(matricula, disciplina));
    }
}
