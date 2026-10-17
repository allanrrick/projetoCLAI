package com.projetoCLAI.atendimento;

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
    private LocalDateTime data;

    @Column(nullable = false)
    private LocalDateTime hora;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private String documentoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    public Atendimento() {
    }

    public Atendimento(LocalDateTime data, LocalDateTime hora, String observacoes, String documentoUrl, Aluno aluno) {
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

    public LocalDateTime getData() {
        return data;
    }

    public void setDataHora(LocalDateTime data) {
        this.data = data;
    }

    public LocalDateTime getHora() {
        return hora;
    }

    public void setHora(LocalDateTime hora) {
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