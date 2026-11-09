package com.projetoCLAI.pea;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeaRepository extends JpaRepository<Pea, Long> {
    List<Pea> findByAluno_MatriculaOrderByDataCriacaoDescIdDesc(String matricula);

    List<Pea> findByAluno_MatriculaAndDisciplinaContainingIgnoreCaseOrderByDataCriacaoDescIdDesc(
            String matricula,
            String disciplina
    );
}
