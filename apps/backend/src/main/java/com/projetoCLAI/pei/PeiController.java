package com.projetoCLAI.pei;

import com.projetoCLAI.pei.DTO.CadastrarPeiDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/aluno/{matricula}/pei")
public class PeiController {

    private final PeiService peiService;

    public PeiController(PeiService peiService) {
        this.peiService = peiService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid CadastrarPeiDTO dto,
                                        BindingResult result,
                                       @PathVariable String matricula
                                       ) {
        if (result.hasErrors()) {
            String msgErro = result.getFieldErrors().get(0).getDefaultMessage();

            return ResponseEntity.badRequest().body(Map.of("Erro", msgErro));
        }
        Long idCriado = peiService.cadastrar(dto, matricula);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", idCriado, "mensagem", "Pei " + idCriado + " criado com sucesso"));
    }

    @GetMapping()
    public ResponseEntity<List<Pei>> buscar(@PathVariable String matricula) {
        List<Pei> peis = peiService.buscar(matricula);
        return ResponseEntity.ok(peis);
    }


}
