package com.projetoCLAI.planoacao;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.auth.Usuario;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "planos_acao", schema = "public")
public class PlanoAcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plano_acao")
    private Long idPlanoAcao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    @JsonIgnore
    private Usuario autor;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(length = 20)
    private String periodoLetivo;

    @Column(length = 20)
    private String periodoIngresso;

    private LocalDate dataNascimento;

    @Column(length = 30)
    private String telefoneAluno;

    @Column(length = 150)
    private String nomeResponsavel;

    @Column(length = 50)
    private String parentescoResponsavel;

    @Column(length = 30)
    private String telefoneResponsavel;

    @Column(length = 150)
    private String emailResponsavel;

    private Boolean possuiComorbidade;

    @Column(columnDefinition = "TEXT")
    private String comorbidades;

    private Boolean usaMedicacaoContinua;

    @Column(columnDefinition = "TEXT")
    private String medicacoes;

    private Boolean frequentaServicosApoio;

    @Column(columnDefinition = "TEXT")
    private String servicosApoio;

    private Boolean apresentouDocumentos;

    @Column(columnDefinition = "TEXT")
    private String documentosComprobatorios;

    @Column(columnDefinition = "TEXT")
    private String necessidadesEspecificas;

    @Column(columnDefinition = "TEXT")
    private String percursoEducacional;

    @Column(columnDefinition = "TEXT")
    private String principaisDemandas;

    @Column(columnDefinition = "TEXT")
    private String propostasIntervencao;

    @Column(length = 150)
    private String nomeCoordenador;

    private LocalDate dataDocumento;

    public PlanoAcao() {
    }

    public Long getIdPlanoAcao() {
        return idPlanoAcao;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public String getPeriodoLetivo() {
        return periodoLetivo;
    }

    public void setPeriodoLetivo(String periodoLetivo) {
        this.periodoLetivo = periodoLetivo;
    }

    public String getPeriodoIngresso() {
        return periodoIngresso;
    }

    public void setPeriodoIngresso(String periodoIngresso) {
        this.periodoIngresso = periodoIngresso;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getTelefoneAluno() {
        return telefoneAluno;
    }

    public void setTelefoneAluno(String telefoneAluno) {
        this.telefoneAluno = telefoneAluno;
    }

    public String getNomeResponsavel() {
        return nomeResponsavel;
    }

    public void setNomeResponsavel(String nomeResponsavel) {
        this.nomeResponsavel = nomeResponsavel;
    }

    public String getParentescoResponsavel() {
        return parentescoResponsavel;
    }

    public void setParentescoResponsavel(String parentescoResponsavel) {
        this.parentescoResponsavel = parentescoResponsavel;
    }

    public String getTelefoneResponsavel() {
        return telefoneResponsavel;
    }

    public void setTelefoneResponsavel(String telefoneResponsavel) {
        this.telefoneResponsavel = telefoneResponsavel;
    }

    public String getEmailResponsavel() {
        return emailResponsavel;
    }

    public void setEmailResponsavel(String emailResponsavel) {
        this.emailResponsavel = emailResponsavel;
    }

    public Boolean getPossuiComorbidade() {
        return possuiComorbidade;
    }

    public void setPossuiComorbidade(Boolean possuiComorbidade) {
        this.possuiComorbidade = possuiComorbidade;
    }

    public String getComorbidades() {
        return comorbidades;
    }

    public void setComorbidades(String comorbidades) {
        this.comorbidades = comorbidades;
    }

    public Boolean getUsaMedicacaoContinua() {
        return usaMedicacaoContinua;
    }

    public void setUsaMedicacaoContinua(Boolean usaMedicacaoContinua) {
        this.usaMedicacaoContinua = usaMedicacaoContinua;
    }

    public String getMedicacoes() {
        return medicacoes;
    }

    public void setMedicacoes(String medicacoes) {
        this.medicacoes = medicacoes;
    }

    public Boolean getFrequentaServicosApoio() {
        return frequentaServicosApoio;
    }

    public void setFrequentaServicosApoio(Boolean frequentaServicosApoio) {
        this.frequentaServicosApoio = frequentaServicosApoio;
    }

    public String getServicosApoio() {
        return servicosApoio;
    }

    public void setServicosApoio(String servicosApoio) {
        this.servicosApoio = servicosApoio;
    }

    public Boolean getApresentouDocumentos() {
        return apresentouDocumentos;
    }

    public void setApresentouDocumentos(Boolean apresentouDocumentos) {
        this.apresentouDocumentos = apresentouDocumentos;
    }

    public String getDocumentosComprobatorios() {
        return documentosComprobatorios;
    }

    public void setDocumentosComprobatorios(String documentosComprobatorios) {
        this.documentosComprobatorios = documentosComprobatorios;
    }

    public String getNecessidadesEspecificas() {
        return necessidadesEspecificas;
    }

    public void setNecessidadesEspecificas(String necessidadesEspecificas) {
        this.necessidadesEspecificas = necessidadesEspecificas;
    }

    public String getPercursoEducacional() {
        return percursoEducacional;
    }

    public void setPercursoEducacional(String percursoEducacional) {
        this.percursoEducacional = percursoEducacional;
    }

    public String getPrincipaisDemandas() {
        return principaisDemandas;
    }

    public void setPrincipaisDemandas(String principaisDemandas) {
        this.principaisDemandas = principaisDemandas;
    }

    public String getPropostasIntervencao() {
        return propostasIntervencao;
    }

    public void setPropostasIntervencao(String propostasIntervencao) {
        this.propostasIntervencao = propostasIntervencao;
    }

    public String getNomeCoordenador() {
        return nomeCoordenador;
    }

    public void setNomeCoordenador(String nomeCoordenador) {
        this.nomeCoordenador = nomeCoordenador;
    }

    public LocalDate getDataDocumento() {
        return dataDocumento;
    }

    public void setDataDocumento(LocalDate dataDocumento) {
        this.dataDocumento = dataDocumento;
    }
}
