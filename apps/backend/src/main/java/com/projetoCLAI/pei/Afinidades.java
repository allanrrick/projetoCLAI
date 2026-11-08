package com.projetoCLAI.pei;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "afinidades_pei", schema = "public")
public class Afinidades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_afinidades")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pei_id")
    @JsonIgnore
    private Pei pei;

    @Column(name = "afinidade")
    private String afinidade;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pei getPei() {
        return pei;
    }

    public void setPei(Pei pei) {
        this.pei = pei;
    }

    public String getAfinidade() {
        return afinidade;
    }

    public void setAfinidade(String afinidade) {
        this.afinidade = afinidade;
    }
}
