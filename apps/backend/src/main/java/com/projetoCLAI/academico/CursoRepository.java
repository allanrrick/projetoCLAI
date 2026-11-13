package com.projetoCLAI.academico;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findAllByOrderByNomeAsc();

    boolean existsByNomeNormalizado(String nomeNormalizado);
}
