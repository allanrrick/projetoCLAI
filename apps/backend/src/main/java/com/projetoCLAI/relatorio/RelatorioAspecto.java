package com.projetoCLAI.relatorio;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "relatorio_aspectos", schema = "public")
public class RelatorioAspecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aspecto")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relatorio_id", nullable = false)
    @JsonIgnore
    private RelatorioAcompanhamento relatorio;

    @Column(nullable = false, length = 30)
    private String grupo;

    @Column(nullable = false, length = 100)
    private String opcao;

    @Column(name = "descricao_outros")
    private String descricaoOutros;

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

    public String getGrupo() {
        return grupo;
    }

    public void setGrupo(String grupo) {
        this.grupo = grupo;
    }

    public String getOpcao() {
        return opcao;
    }

    public void setOpcao(String opcao) {
        this.opcao = opcao;
    }

    public String getDescricaoOutros() {
        return descricaoOutros;
    }

    public void setDescricaoOutros(String descricaoOutros) {
        this.descricaoOutros = descricaoOutros;
    }
}
