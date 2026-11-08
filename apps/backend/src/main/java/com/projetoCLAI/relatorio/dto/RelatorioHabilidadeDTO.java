package com.projetoCLAI.relatorio.dto;

public record RelatorioHabilidadeDTO(
        Integer ordem,
        String habilidadeDesenvolvida,
        String nivelAprendizado,
        String observacoes
) {
}