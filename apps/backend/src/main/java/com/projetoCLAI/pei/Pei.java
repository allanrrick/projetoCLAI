package com.projetoCLAI.pei;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;

@Entity
@Table(name = "peis")
public class Pei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPei;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String necessidadesEspecificas;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objetivos;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String estrategiasAcompanhamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    public Pei() {
    }

    public Pei(String necessidadesEspecificas, String objetivos, String estrategiasAcompanhamento, Aluno aluno) {
        this.necessidadesEspecificas = necessidadesEspecificas;
        this.objetivos = objetivos;
        this.estrategiasAcompanhamento = estrategiasAcompanhamento;
        this.aluno = aluno;
    }

    public Long getId() {
        return idPei;
    }

    public String getNecessidadesEspecificas() {
        return necessidadesEspecificas;
    }

    public void setNecessidadesEspecificas(String necessidadesEspecificas) {
        this.necessidadesEspecificas = necessidadesEspecificas;
    }

    public String getObjetivos() {
        return objetivos;
    }

    public void setObjetivos(String objetivos) {
        this.objetivos = objetivos;
    }

    public String getEstrategiasAcompanhamento() {
        return estrategiasAcompanhamento;
    }

    public void setEstrategiasAcompanhamento(String estrategiasAcompanhamento) {
        this.estrategiasAcompanhamento = estrategiasAcompanhamento;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}
