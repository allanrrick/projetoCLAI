package com.projetoCLAI.planoacao;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanoAcaoRepository extends JpaRepository<PlanoAcao, Long> {
    List<PlanoAcao> findByAlunoIdAlunoOrderByDataCriacaoDescIdPlanoAcaoDesc(Long idAluno);
}
