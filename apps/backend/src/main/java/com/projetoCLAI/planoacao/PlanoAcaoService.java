package com.projetoCLAI.planoacao;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PlanoAcaoService {

    private final PlanoAcaoRepository planoAcaoRepository;
    private final AlunoRepository alunoRepository;

    public PlanoAcaoService(
            PlanoAcaoRepository planoAcaoRepository,
            AlunoRepository alunoRepository) {
        this.planoAcaoRepository = planoAcaoRepository;
        this.alunoRepository = alunoRepository;
    }

    public String validar(CriarPlanoAcaoDTO dto) {
        if (dto == null || dto.idAluno() == null) {
            return "Selecione um aluno válido para registrar o plano de ação.";
        }
        if (isBlank(dto.necessidadesEspecificas())) {
            return "O campo 'Necessidades específicas' é obrigatório.";
        }
        if (isBlank(dto.percursoEducacional())) {
            return "O campo 'Avanços, dificuldades e potencialidades no percurso educacional' é obrigatório.";
        }
        if (isBlank(dto.principaisDemandas())) {
            return "O campo 'Principais demandas' é obrigatório.";
        }
        if (isBlank(dto.propostasIntervencao())) {
            return "O campo 'Propostas iniciais de intervenção' é obrigatório.";
        }
        if (isBlank(dto.assinaturaCoordenador())) {
            return "A assinatura ou identificação da coordenação é obrigatória.";
        }
        if (dto.dataDocumento() == null) {
            return "A data do documento é obrigatória.";
        }
        if (Boolean.TRUE.equals(dto.possuiComorbidades()) && isBlank(dto.comorbidades())) {
            return "Descreva as comorbidades quando informado que o aluno possui comorbidades.";
        }
        if (Boolean.TRUE.equals(dto.usoMedicacaoContinua()) && isBlank(dto.medicacaoContinua())) {
            return "Descreva a medicação de uso contínuo quando informado que o aluno faz uso.";
        }
        return null;
    }

    @Transactional
    public Optional<PlanoAcaoResponseDTO> cadastrar(CriarPlanoAcaoDTO dto, String autorSessao) {
        Optional<Aluno> encontrado = alunoRepository.findById(dto.idAluno());
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }
        Aluno aluno = encontrado.get();
        boolean possuiComorbidades = Boolean.TRUE.equals(dto.possuiComorbidades());
        boolean usoMedicacaoContinua = Boolean.TRUE.equals(dto.usoMedicacaoContinua());

        PlanoAcao plano = new PlanoAcao();
        plano.setAluno(aluno);
        plano.setResponsavelNome(trimToNull(dto.responsavelNome()));
        plano.setResponsavelParentesco(trimToNull(dto.responsavelParentesco()));
        plano.setResponsavelContato(trimToNull(dto.responsavelContato()));
        plano.setPossuiComorbidades(possuiComorbidades);
        plano.setComorbidades(possuiComorbidades ? trimToNull(dto.comorbidades()) : null);
        plano.setUsoMedicacaoContinua(usoMedicacaoContinua);
        plano.setMedicacaoContinua(usoMedicacaoContinua ? trimToNull(dto.medicacaoContinua()) : null);
        plano.setServicosApoio(trimToNull(dto.servicosApoio()));
        plano.setDocumentosComprobatorios(trimToNull(dto.documentosComprobatorios()));
        plano.setNecessidadesEspecificas(dto.necessidadesEspecificas().trim());
        plano.setPercursoEducacional(dto.percursoEducacional().trim());
        plano.setPrincipaisDemandas(dto.principaisDemandas().trim());
        plano.setPropostasIntervencao(dto.propostasIntervencao().trim());
        plano.setAssinaturaCoordenador(dto.assinaturaCoordenador().trim());
        plano.setDataDocumento(dto.dataDocumento());
        plano.setAutor(autorSessao != null && !autorSessao.isBlank() ? autorSessao.trim() : "Profissional CLAI");
        plano.setCriadoEm(LocalDateTime.now());

        PlanoAcao salvo = planoAcaoRepository.save(plano);
        return Optional.of(PlanoAcaoResponseDTO.fromEntity(salvo));
    }

    @Transactional(readOnly = true)
    public Optional<List<PlanoAcaoResponseDTO>> listarPorAluno(Long idAluno) {
        if (!alunoRepository.existsById(idAluno)) {
            return Optional.empty();
        }
        List<PlanoAcaoResponseDTO> lista = planoAcaoRepository
                .findByAluno_IdAlunoOrderByDataDocumentoDescIdPlanoDesc(idAluno)
                .stream()
                .map(PlanoAcaoResponseDTO::fromEntity)
                .toList();
        return Optional.of(lista);
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.trim().isEmpty();
    }

    private String trimToNull(String valor) {
        if (valor == null) {
            return null;
        }
        String limpo = valor.trim();
        return limpo.isEmpty() ? null : limpo;
    }
}
