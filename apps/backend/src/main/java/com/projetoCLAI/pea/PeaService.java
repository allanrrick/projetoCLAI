package com.projetoCLAI.pea;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class PeaService {

    private final PeaRepository peaRepository;
    private final AlunoRepository alunoRepository;

    public PeaService(PeaRepository peaRepository, AlunoRepository alunoRepository) {
        this.peaRepository = peaRepository;
        this.alunoRepository = alunoRepository;
    }

    @Transactional
    public Pea cadastrar(CadastrarPeaDTO dto, String matricula) {
        Aluno aluno = alunoRepository.findByMatricula(matricula);
        if (aluno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado");
        }

        Pea pea = new Pea();
        pea.setAluno(aluno);
        pea.setDisciplina(dto.disciplina().trim());
        pea.setPeriodoLetivo(dto.periodoLetivo().trim());
        pea.setDocente(dto.docente().trim());
        pea.setObjetivos(dto.objetivos().trim());
        pea.setConteudos(dto.conteudos().trim());
        pea.setEstrategiasEnsino(dto.estrategiasEnsino().trim());
        pea.setAvaliacaoAdaptada(dto.avaliacaoAdaptada().trim());
        pea.setDataCriacao(LocalDate.now());

        return peaRepository.save(pea);
    }

    @Transactional
    public List<Pea> buscar(String matricula, String disciplina) {
        if (disciplina != null && !disciplina.isBlank()) {
            return peaRepository
                    .findByAluno_MatriculaAndDisciplinaContainingIgnoreCaseOrderByDataCriacaoDescIdDesc(
                            matricula,
                            disciplina.trim()
                    );
        }
        return peaRepository.findByAluno_MatriculaOrderByDataCriacaoDescIdDesc(matricula);
    }
}
