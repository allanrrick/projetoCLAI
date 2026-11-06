package com.projetoCLAI.relatorio;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "relatorios_acompanhamento", schema = "public")
public class RelatorioAcompanhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relatorio")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    @Column(name = "periodo_letivo", length = 50)
    private String periodoLetivo;

    @Column(name = "componente_curricular", length = 150)
    private String componenteCurricular;

    @Column(length = 150)
    private String docente;

    @Column(name = "comentario_relacionamento")
    private String comentarioRelacionamento;

    @Column(name = "comentario_cognitivo")
    private String comentarioCognitivo;

    @Column(name = "comentario_socioemocional")
    private String comentarioSocioemocional;

    @Column(name = "avancos_gerais")
    private String avancosGerais;

    @Column(name = "relato_dificuldades")
    private String relatoDificuldades;

    @Column(name = "fatores_externos")
    private String fatoresExternos;

    @Column(columnDefinition = "TEXT")
    private String parecer;

    @Column(name = "data_relatorio")
    private LocalDate dataRelatorio;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "relatorio",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<RelatorioAspecto> aspectos = new ArrayList<>();

    @OneToMany(mappedBy = "relatorio",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<RelatorioHabilidade> habilidades = new ArrayList<>();

    public List<RelatorioAspecto> getAspectos() {
        return aspectos;
    }

    public void setAspectos(List<RelatorioAspecto> aspectos) {
        this.aspectos = aspectos;
    }

    public List<RelatorioHabilidade> getHabilidades() {
        return habilidades;
    }

    public void setHabilidades(List<RelatorioHabilidade> habilidades) {
        this.habilidades = habilidades;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public String getPeriodoLetivo() {
        return periodoLetivo;
    }

    public void setPeriodoLetivo(String periodoLetivo) {
        this.periodoLetivo = periodoLetivo;
    }

    public String getComponenteCurricular() {
        return componenteCurricular;
    }

    public void setComponenteCurricular(String componenteCurricular) {
        this.componenteCurricular = componenteCurricular;
    }

    public String getDocente() {
        return docente;
    }

    public void setDocente(String docente) {
        this.docente = docente;
    }

    public String getComentarioRelacionamento() {
        return comentarioRelacionamento;
    }

    public void setComentarioRelacionamento(String comentarioRelacionamento) {
        this.comentarioRelacionamento = comentarioRelacionamento;
    }

    public String getComentarioCognitivo() {
        return comentarioCognitivo;
    }

    public void setComentarioCognitivo(String comentarioCognitivo) {
        this.comentarioCognitivo = comentarioCognitivo;
    }

    public String getComentarioSocioemocional() {
        return comentarioSocioemocional;
    }

    public void setComentarioSocioemocional(String comentarioSocioemocional) {
        this.comentarioSocioemocional = comentarioSocioemocional;
    }

    public String getAvancosGerais() {
        return avancosGerais;
    }

    public void setAvancosGerais(String avancosGerais) {
        this.avancosGerais = avancosGerais;
    }

    public String getRelatoDificuldades() {
        return relatoDificuldades;
    }

    public void setRelatoDificuldades(String relatoDificuldades) {
        this.relatoDificuldades = relatoDificuldades;
    }

    public String getFatoresExternos() {
        return fatoresExternos;
    }

    public void setFatoresExternos(String fatoresExternos) {
        this.fatoresExternos = fatoresExternos;
    }

    public String getParecer() {
        return parecer;
    }

    public void setParecer(String parecer) {
        this.parecer = parecer;
    }

    public LocalDate getDataRelatorio() {
        return dataRelatorio;
    }

    public void setDataRelatorio(LocalDate dataRelatorio) {
        this.dataRelatorio = dataRelatorio;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
