package com.projetoCLAI.academico;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CadastroAcademicoService {

    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;

    public CadastroAcademicoService(CursoRepository cursoRepository, DisciplinaRepository disciplinaRepository) {
        this.cursoRepository = cursoRepository;
        this.disciplinaRepository = disciplinaRepository;
    }

    @Transactional(readOnly = true)
    public List<Curso> listarCursos() {
        return cursoRepository.findAllByOrderByNomeAsc();
    }

    @Transactional
    public Curso cadastrarCurso(String nome) {
        Curso curso = new Curso();
        curso.setNome(nome);
        if (cursoRepository.existsByNomeNormalizado(curso.getNomeNormalizado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um curso com este nome.");
        }
        try {
            return cursoRepository.saveAndFlush(curso);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um curso com este nome.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Disciplina> listarDisciplinas() {
        return disciplinaRepository.findAllByOrderByNomeAsc();
    }

    @Transactional
    public Disciplina cadastrarDisciplina(String nome) {
        Disciplina disciplina = new Disciplina();
        disciplina.setNome(nome);
        if (disciplinaRepository.existsByNomeNormalizado(disciplina.getNomeNormalizado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma disciplina com este nome.");
        }
        try {
            return disciplinaRepository.saveAndFlush(disciplina);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma disciplina com este nome.", e);
        }
    }
}
