package com.projetoCLAI.auth;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios", schema = "public")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Column(nullable = false, length = 50)
    private String perfil = PerfilUsuario.PROFISSIONAL_CLAI.name();

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDate dataCadastro = LocalDate.now();

    public Usuario() {
    }

    public Usuario(String nome, String email, String senhaHash, String perfil) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.perfil = PerfilUsuario.fromString(perfil).name();
        this.ativo = true;
        this.dataCadastro = LocalDate.now();
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = PerfilUsuario.fromString(perfil).name();
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDate getDataCadastro() {
        return dataCadastro;
    }
}

