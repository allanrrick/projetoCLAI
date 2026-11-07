package com.projetoCLAI.pei.repository;

import com.projetoCLAI.pei.Pei;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeiRepository extends JpaRepository<Pei, Long> {
    List<Pei> findByAluno_Matricula(String matricula);
}
