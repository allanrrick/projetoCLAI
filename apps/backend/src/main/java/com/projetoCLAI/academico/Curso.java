package com.projetoCLAI.academico;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.text.Normalizer;
import java.util.Locale;

@Entity
@Table(name = "curso", schema = "public")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curso")
    private Long idCurso;

    @Column(nullable = false, length = 100)
    private String nome;

    @JsonIgnore
    @Column(name = "nome_normalizado", nullable = false, unique = true, length = 100)
    private String nomeNormalizado;

    public Curso() {
    }

    public Long getIdCurso() {
        return idCurso;
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
