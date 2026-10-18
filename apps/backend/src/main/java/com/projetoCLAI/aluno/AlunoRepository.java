package com.projetoCLAI.aluno;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AlunoRepository
        extends JpaRepository<Aluno, Long> {

    boolean existsByMatricula(String matricula);

    boolean existsByEmail(String email);

    Aluno findByMatricula(String matricula);
}