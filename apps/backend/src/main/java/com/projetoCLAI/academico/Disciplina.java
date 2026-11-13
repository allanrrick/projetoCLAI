package com.projetoCLAI.academico;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.text.Normalizer;
import java.util.Locale;

@Entity
@Table(name = "disciplina", schema = "public")
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disciplina")
    private Long idDisciplina;

    @Column(nullable = false, length = 150)
    private String nome;

    @JsonIgnore
    @Column(name = "nome_normalizado", nullable = false, unique = true, length = 150)
    private String nomeNormalizado;

    public Disciplina() {
    }

    public Long getIdDisciplina() {
        return idDisciplina;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome.strip().replaceAll("\\s+", " ");
        this.nomeNormalizado = Normalizer.normalize(this.nome, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    public String getNomeNormalizado() {
        return nomeNormalizado;
    }
}
