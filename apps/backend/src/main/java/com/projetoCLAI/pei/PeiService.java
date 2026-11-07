package com.projetoCLAI.pei;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.pei.DTO.CadastrarPeiDTO;
import com.projetoCLAI.pei.repository.PeiRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class PeiService {

    private final PeiRepository peiRepository;
    private final AlunoRepository alunoRepository;

    public PeiService(PeiRepository peiRepository, AlunoRepository alunoRepository) {
        this.peiRepository = peiRepository;
        this.alunoRepository = alunoRepository;
    }

    @Transactional
    public Long cadastrar(CadastrarPeiDTO dto) {
        Aluno aluno = alunoRepository.findByMatricula(dto.alunoMatricula());

        if (aluno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado");
        }

        Pei pei = new Pei();
        pei.setAluno(aluno);
        pei.setDataCriacao(LocalDate.now());
        pei.setDificuldades(dto.dificuldades());
        pei.setHistorico(dto.historico());
        pei.setNecessidadesEspecificas(dto.necessidades());
        pei.setPeriodoLetivo(dto.periodoLetivo());
        pei.setPropostasAdaptacao(dto.propostas());

        if (dto.afinidades() != null && !dto.afinidades().isEmpty()) {
            List<Afinidades> listaAfinidades = dto.afinidades().stream().map(itemDTO -> {
                Afinidades af = new Afinidades();
                af.setAfinidade(itemDTO.afinidade());

                af.setPei(pei);

                return af;
            }).toList();


            pei.getAfinidades().addAll(listaAfinidades);
        }

        Pei salvo = peiRepository.save(pei);
        return salvo.getId();
    }
}
