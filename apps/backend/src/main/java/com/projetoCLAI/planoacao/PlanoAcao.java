package com.projetoCLAI.planoacao;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projetoCLAI.aluno.Aluno;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "planos_acao", schema = "public")
public class PlanoAcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plano")
    private Long idPlano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnore
    private Aluno aluno;

    @Column(name = "responsavel_nome", length = 150)
    private String responsavelNome;

    @Column(name = "responsavel_parentesco", length = 80)
    private String responsavelParentesco;

    @Column(name = "responsavel_contato", length = 100)
    private String responsavelContato;

    @Column(name = "possui_comorbidades", nullable = false)
    private boolean possuiComorbidades;

    @Column(name = "comorbidades", columnDefinition = "TEXT")
    private String comorbidades;

    @Column(name = "uso_medicacao_continua", nullable = false)
    private boolean usoMedicacaoContinua;

    @Column(name = "medicacao_continua", columnDefinition = "TEXT")
    private String medicacaoContinua;

    @Column(name = "servicos_apoio", columnDefinition = "TEXT")
    private String servicosApoio;

    @Column(name = "documentos_comprobatorios", columnDefinition = "TEXT")
    private String documentosComprobatorios;

    @Column(name = "necessidades_especificas", nullable = false, columnDefinition = "TEXT")
    private String necessidadesEspecificas;

    @Column(name = "percurso_educacional", nullable = false, columnDefinition = "TEXT")
    private String percursoEducacional;

    @Column(name = "principais_demandas", nullable = false, columnDefinition = "TEXT")
    private String principaisDemandas;

    @Column(name = "propostas_intervencao", nullable = false, columnDefinition = "TEXT")
    private String propostasIntervencao;

    @Column(name = "assinatura_coordenador", nullable = false, length = 150)
    private String assinaturaCoordenador;

    @Column(name = "data_documento", nullable = false)
    private LocalDate dataDocumento;

    @Column(name = "autor", nullable = false, length = 150)
    private String autor;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    public Long getIdPlano() {
        return idPlano;
    }

    public void setIdPlano(Long idPlano) {
        this.idPlano = idPlano;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public String getResponsavelNome() {
        return responsavelNome;
    }

    public void setResponsavelNome(String responsavelNome) {
        this.responsavelNome = responsavelNome;
    }

    public String getResponsavelParentesco() {
        return responsavelParentesco;
    }

    public void setResponsavelParentesco(String responsavelParentesco) {
        this.responsavelParentesco = responsavelParentesco;
    }

    public String getResponsavelContato() {
        return responsavelContato;
    }

    public void setResponsavelContato(String responsavelContato) {
        this.responsavelContato = responsavelContato;
    }

    public boolean isPossuiComorbidades() {
        return possuiComorbidades;
    }

    public void setPossuiComorbidades(boolean possuiComorbidades) {
        this.possuiComorbidades = possuiComorbidades;
    }

    public String getComorbidades() {
        return comorbidades;
    }

    public void setComorbidades(String comorbidades) {
        this.comorbidades = comorbidades;
    }

    public boolean isUsoMedicacaoContinua() {
        return usoMedicacaoContinua;
    }

    public void setUsoMedicacaoContinua(boolean usoMedicacaoContinua) {
        this.usoMedicacaoContinua = usoMedicacaoContinua;
    }

    public String getMedicacaoContinua() {
        return medicacaoContinua;
    }

    public void setMedicacaoContinua(String medicacaoContinua) {
        this.medicacaoContinua = medicacaoContinua;
    }

    public String getServicosApoio() {
        return servicosApoio;
    }

    public void setServicosApoio(String servicosApoio) {
        this.servicosApoio = servicosApoio;
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

    public String getAssinaturaCoordenador() {
        return assinaturaCoordenador;
    }

    public void setAssinaturaCoordenador(String assinaturaCoordenador) {
        this.assinaturaCoordenador = assinaturaCoordenador;
    }

    public LocalDate getDataDocumento() {
        return dataDocumento;
    }

    public void setDataDocumento(LocalDate dataDocumento) {
        this.dataDocumento = dataDocumento;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
