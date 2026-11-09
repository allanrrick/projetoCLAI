package com.projetoCLAI.pei;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pei")
public class Pei {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_matricula", referencedColumnName = "matricula", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    @Column(name = "periodo_letivo", length = 50)
    private String periodoLetivo;

    @Column(name = "historico")
    private String historico;;

    @Column(name = "necessidades_especificas")
    private String necessidadesEspecificas;

    @OneToMany(mappedBy = "pei",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Afinidades> afinidades = new ArrayList<>();

    @Column(name = "dificuldades")
    private String dificuldades;

    @Column(name = "propostas_adaptacao")
    private String propostasAdaptacao;

    @Column(name = "data_criacao", updatable = false)
    private LocalDate dataCriacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public String getAlunoMatricula() {
        return aluno != null ? aluno.getMatricula() : null;
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

    public String getNecessidadesEspecificas() {
        return necessidadesEspecificas;
    }

    public void setNecessidadesEspecificas(String necessidadesEspecificas) {
        this.necessidadesEspecificas = necessidadesEspecificas;
    }

    public String getHistorico() {
        return historico;
    }

    public void setHistorico(String historico) {
        this.historico = historico;
    }

    public List<Afinidades> getAfinidades() {
        return afinidades;
    }

    public void setAfinidades(List<Afinidades> afinidades) {
        this.afinidades = afinidades;
    }

    public String getDificuldades() {
        return dificuldades;
    }

    public void setDificuldades(String dificuldades) {
        this.dificuldades = dificuldades;
    }

    public String getPropostasAdaptacao() {
        return propostasAdaptacao;
    }

    public void setPropostasAdaptacao(String propostasAdaptacao) {
        this.propostasAdaptacao = propostasAdaptacao;
    }

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
