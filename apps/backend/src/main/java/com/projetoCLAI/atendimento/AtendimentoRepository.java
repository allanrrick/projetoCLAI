package com.projetoCLAI.atendimento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {
    List<Atendimento> findByAlunoMatricula(String matricula);
	List<Atendimento> findByAlunoMatriculaOrderByDataDescHoraDesc(String matricula);
}
