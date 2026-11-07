package com.projetoCLAI.pei;

import com.projetoCLAI.pei.DTO.CadastrarPeiDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pei")
public class PeiController {

    private final PeiService peiService;

    public PeiController(PeiService peiService) {
        this.peiService = peiService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid CadastrarPeiDTO dto) {
        Long idCriado = peiService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Pei " +idCriado+ " criado com sucesso");
    }


}
