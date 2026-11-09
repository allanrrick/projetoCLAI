package com.projetoCLAI.pea;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "pea")
public class Pea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_matricula", referencedColumnName = "matricula", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    @Column(name = "disciplina", nullable = false, length = 150)
    private String disciplina;

    @Column(name = "periodo_letivo", nullable = false, length = 50)
    private String periodoLetivo;

    @Column(name = "docente", nullable = false, length = 150)
    private String docente;

    @Column(name = "objetivos", nullable = false, columnDefinition = "TEXT")
    private String objetivos;

    @Column(name = "conteudos", nullable = false, columnDefinition = "TEXT")
    private String conteudos;

    @Column(name = "estrategias_ensino", nullable = false, columnDefinition = "TEXT")
    private String estrategiasEnsino;

    @Column(name = "avaliacao_adaptada", nullable = false, columnDefinition = "TEXT")
    private String avaliacaoAdaptada;

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

    public String getDisciplina() {
        return disciplina;
    }

    public void setDisciplina(String disciplina) {
        this.disciplina = disciplina;
    }

    public String getPeriodoLetivo() {
        return periodoLetivo;
    }

    public void setPeriodoLetivo(String periodoLetivo) {
        this.periodoLetivo = periodoLetivo;
    }

    public String getDocente() {
        return docente;
    }

    public void setDocente(String docente) {
        this.docente = docente;
    }

    public String getObjetivos() {
        return objetivos;
    }

    public void setObjetivos(String objetivos) {
        this.objetivos = objetivos;
    }

    public String getConteudos() {
        return conteudos;
    }

    public void setConteudos(String conteudos) {
        this.conteudos = conteudos;
    }

    public String getEstrategiasEnsino() {
        return estrategiasEnsino;
    }

    public void setEstrategiasEnsino(String estrategiasEnsino) {
        this.estrategiasEnsino = estrategiasEnsino;
    }

    public String getAvaliacaoAdaptada() {
        return avaliacaoAdaptada;
    }

    public void setAvaliacaoAdaptada(String avaliacaoAdaptada) {
        this.avaliacaoAdaptada = avaliacaoAdaptada;
    }

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
