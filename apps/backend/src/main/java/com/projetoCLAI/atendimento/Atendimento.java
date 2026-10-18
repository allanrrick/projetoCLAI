package com.projetoCLAI.atendimento;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "atendimentos")
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAtendimento;

    @Column(nullable = false)
    private String data;

    @Column(nullable = false)
    private String hora;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private String documentoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    public Atendimento() {
    }

    public Atendimento(String data, String hora, String observacoes, String documentoUrl, Aluno aluno) {
        this.data = data;
        this.hora = hora;
        this.observacoes = observacoes;
        this.documentoUrl = documentoUrl;
        this.aluno = aluno;
    }

    // Getters e Setters
    public Long getId() {
        return idAtendimento;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public String getDocumentoUrl() {
        return documentoUrl;
    }

    public void setDocumentoUrl(String documentoUrl) {
        this.documentoUrl = documentoUrl;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}