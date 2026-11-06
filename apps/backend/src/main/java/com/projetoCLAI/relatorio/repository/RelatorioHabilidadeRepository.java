package com.projetoCLAI.relatorio.repository;

import com.projetoCLAI.relatorio.RelatorioHabilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatorioHabilidadeRepository
        extends JpaRepository<RelatorioHabilidade, Long> {

    List<RelatorioHabilidade> findByRelatorio_IdOrderByOrdemAsc(
            Long relatorioId
    );
}
