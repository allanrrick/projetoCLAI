package com.projetoCLAI.aluno;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlunoRepository
        extends JpaRepository<Aluno, Long> {

    boolean existsByMatricula(String matricula);

    boolean existsByEmail(String email);
}