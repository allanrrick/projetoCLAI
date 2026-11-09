package com.projetoCLAI.relatorio.repository;

import com.projetoCLAI.relatorio.RelatorioAspecto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatorioAspectoRepository
        extends JpaRepository<RelatorioAspecto, Long> {

    List<RelatorioAspecto> findByRelatorio_Id(Long relatorioId);
}
