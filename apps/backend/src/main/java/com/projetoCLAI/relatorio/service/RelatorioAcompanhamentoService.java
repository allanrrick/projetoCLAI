package com.projetoCLAI.relatorio.service;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.relatorio.RelatorioAcompanhamento;
import com.projetoCLAI.relatorio.RelatorioAspecto;
import com.projetoCLAI.relatorio.RelatorioHabilidade;
import com.projetoCLAI.relatorio.dto.CriarRelatorioDTO;
import com.projetoCLAI.relatorio.dto.RelatorioAspectoDTO;
import com.projetoCLAI.relatorio.dto.RelatorioHabilidadeDTO;
import com.projetoCLAI.relatorio.repository.RelatorioAcompanhamentoRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RelatorioAcompanhamentoService {

    private final AlunoRepository alunoRepository;
    private final RelatorioAcompanhamentoRepository relatorioRepository;

    public RelatorioAcompanhamentoService(
            AlunoRepository alunoRepository,
            RelatorioAcompanhamentoRepository relatorioRepository) {
        this.alunoRepository = alunoRepository;
        this.relatorioRepository = relatorioRepository;
    }

    @Transactional
    public RelatorioAcompanhamento cadastrar(CriarRelatorioDTO dto) {

        Aluno aluno = alunoRepository.findById(dto.alunoId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado."));

        RelatorioAcompanhamento relatorio = new RelatorioAcompanhamento();

        relatorio.setAluno(aluno);
        relatorio.setPeriodoLetivo(dto.periodoLetivo());
        relatorio.setComponenteCurricular(dto.componenteCurricular());
        relatorio.setDocente(dto.docente());

        relatorio.setComentarioRelacionamento(dto.comentarioRelacionamento());
        relatorio.setComentarioCognitivo(dto.comentarioCognitivo());
        relatorio.setComentarioSocioemocional(dto.comentarioSocioemocional());

        relatorio.setAvancosGerais(dto.avancosGerais());
        relatorio.setRelatoDificuldades(dto.relatoDificuldades());
        relatorio.setFatoresExternos(dto.fatoresExternos());

        relatorio.setParecer(dto.parecer());
        relatorio.setDataRelatorio(dto.dataRelatorio());

        if (dto.aspectos() != null) {
            for (RelatorioAspectoDTO aspectoDTO : dto.aspectos()) {

                RelatorioAspecto aspecto = new RelatorioAspecto();

                aspecto.setRelatorio(relatorio);
                aspecto.setGrupo(aspectoDTO.grupo());
                aspecto.setOpcao(aspectoDTO.opcao());
                aspecto.setDescricaoOutros(aspectoDTO.descricaoOutros());

                relatorio.getAspectos().add(aspecto);
            }
        }

        if (dto.habilidades() != null) {
            for (RelatorioHabilidadeDTO habilidadeDTO : dto.habilidades()) {

                RelatorioHabilidade habilidade = new RelatorioHabilidade();

                habilidade.setRelatorio(relatorio);
                habilidade.setOrdem(habilidadeDTO.ordem());
                habilidade.setHabilidadeDesenvolvida(
                        habilidadeDTO.habilidadeDesenvolvida()
                );
                habilidade.setNivelAprendizado(
                        habilidadeDTO.nivelAprendizado()
                );
                habilidade.setObservacoes(habilidadeDTO.observacoes());

                relatorio.getHabilidades().add(habilidade);
            }
        }

        return relatorioRepository.save(relatorio);

    }

        @Transactional(readOnly = true)
        public List<RelatorioAcompanhamento> listarTodos() {
            return relatorioRepository.findAll();
        }
}