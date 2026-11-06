package com.projetoCLAI.relatorio;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "relatorio_habilidades", schema = "public")
public class RelatorioHabilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_habilidade")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relatorio_id", nullable = false)
    @JsonIgnore
    private RelatorioAcompanhamento relatorio;

    @Column(nullable = false)
    private Integer ordem;

    @Column(name = "habilidade_desenvolvida", nullable = false)
    private String habilidadeDesenvolvida;

    @Column(name = "nivel_aprendizado", length = 20)
    private String nivelAprendizado;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RelatorioAcompanhamento getRelatorio() {
        return relatorio;
    }

    public void setRelatorio(RelatorioAcompanhamento relatorio) {
        this.relatorio = relatorio;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public String getHabilidadeDesenvolvida() {
        return habilidadeDesenvolvida;
    }

    public void setHabilidadeDesenvolvida(String habilidadeDesenvolvida) {
        this.habilidadeDesenvolvida = habilidadeDesenvolvida;
    }

    public String getNivelAprendizado() {
        return nivelAprendizado;
    }

    public void setNivelAprendizado(String nivelAprendizado) {
        this.nivelAprendizado = nivelAprendizado;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
