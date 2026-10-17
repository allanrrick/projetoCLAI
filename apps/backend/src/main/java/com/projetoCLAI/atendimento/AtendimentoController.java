package com.projetoCLAI.atendimento;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.atendimento.atendimentoDTO.CadastroAtendimentoDTO;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/atendimentos")

public class AtendimentoController {

    private final AtendimentoRepository atendimentoRepository;
    private final AlunoRepository alunoRepository;

    public AtendimentoController(AtendimentoRepository atendimentoRepository, AlunoRepository alunoRepository) {
        this.atendimentoRepository = atendimentoRepository;
        this.alunoRepository = alunoRepository;
    }

    @PostMapping (consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criar(
            @ModelAttribute @Valid CadastroAtendimentoDTO dto) {
    }

}