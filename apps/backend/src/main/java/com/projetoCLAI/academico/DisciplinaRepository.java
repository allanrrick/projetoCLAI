package com.projetoCLAI.academico;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    List<Disciplina> findAllByOrderByNomeAsc();

    boolean existsByNomeNormalizado(String nomeNormalizado);
}
