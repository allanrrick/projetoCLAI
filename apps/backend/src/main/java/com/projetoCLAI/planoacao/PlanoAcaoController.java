package com.projetoCLAI.planoacao;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.auth.AuthController;
import com.projetoCLAI.auth.PerfilUsuario;
import com.projetoCLAI.auth.Usuario;
import com.projetoCLAI.auth.UsuarioRepository;
import com.projetoCLAI.planoacao.planoacaoDTO.CadastrarPlanoAcaoDTO;
import com.projetoCLAI.planoacao.planoacaoDTO.PlanoAcaoResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/planos-acao")
public class PlanoAcaoController {
    private final PlanoAcaoRepository planoRepository;
    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;

    public PlanoAcaoController(PlanoAcaoRepository planoRepository,
                              AlunoRepository alunoRepository, UsuarioRepository usuarioRepository) {
        this.planoRepository = planoRepository;
        this.alunoRepository = alunoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PlanoAcaoResponseDTO> cadastrar(
            @Valid @RequestBody CadastrarPlanoAcaoDTO dto, HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        Long idAutor = sessao == null ? null : (Long) sessao.getAttribute(AuthController.ATTR_USUARIO_ID);
        if (idAutor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre novamente para registrar o plano.");
        }
        Usuario autor = usuarioRepository.findById(idAutor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
        if (!Boolean.TRUE.equals(autor.getAtivo())
                || !PerfilUsuario.PROFISSIONAL_CLAI.name().equals(autor.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para registrar planos.");
        }
        Aluno aluno = alunoRepository.findById(dto.idAluno())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado."));

        validarDescricao(dto.possuiComorbidade(), dto.comorbidades(), "as comorbidades");
        validarDescricao(dto.usaMedicacaoContinua(), dto.medicacoes(), "as medicações");
        validarDescricao(dto.frequentaServicosApoio(), dto.servicosApoio(), "os serviços de apoio");
        validarDescricao(dto.apresentouDocumentos(), dto.documentosComprobatorios(), "os documentos comprobatórios");

        PlanoAcao plano = new PlanoAcao();
        plano.setAluno(aluno);
        plano.setAutor(autor);
        plano.setPeriodoLetivo(dto.periodoLetivo().trim());
        plano.setPeriodoIngresso(limpar(dto.periodoIngresso()));
        plano.setDataNascimento(dto.dataNascimento());
        plano.setTelefoneAluno(limpar(dto.telefoneAluno()));
        plano.setNomeResponsavel(limpar(dto.nomeResponsavel()));
        plano.setParentescoResponsavel(limpar(dto.parentescoResponsavel()));
        plano.setTelefoneResponsavel(limpar(dto.telefoneResponsavel()));
        plano.setEmailResponsavel(limpar(dto.emailResponsavel()));
        plano.setPossuiComorbidade(dto.possuiComorbidade());
        plano.setComorbidades(dto.possuiComorbidade() ? limpar(dto.comorbidades()) : null);
        plano.setUsaMedicacaoContinua(dto.usaMedicacaoContinua());
        plano.setMedicacoes(dto.usaMedicacaoContinua() ? limpar(dto.medicacoes()) : null);
        plano.setFrequentaServicosApoio(dto.frequentaServicosApoio());
        plano.setServicosApoio(dto.frequentaServicosApoio() ? limpar(dto.servicosApoio()) : null);
        plano.setApresentouDocumentos(dto.apresentouDocumentos());
        plano.setDocumentosComprobatorios(dto.apresentouDocumentos() ? limpar(dto.documentosComprobatorios()) : null);
        plano.setNecessidadesEspecificas(dto.necessidadesEspecificas().trim());
        plano.setPercursoEducacional(dto.percursoEducacional().trim());
        plano.setPrincipaisDemandas(dto.principaisDemandas().trim());
        plano.setPropostasIntervencao(dto.propostasIntervencao().trim());
        plano.setNomeCoordenador(dto.nomeCoordenador().trim());
        plano.setDataDocumento(dto.dataDocumento());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new PlanoAcaoResponseDTO(planoRepository.save(plano)));
    }

    @GetMapping("/aluno/{idAluno}")
    @Transactional(readOnly = true)
    public List<PlanoAcaoResponseDTO> consultar(@PathVariable Long idAluno) {
        if (!alunoRepository.existsById(idAluno)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado.");
        }
        return planoRepository.findByAlunoIdAlunoOrderByDataCriacaoDescIdPlanoAcaoDesc(idAluno)
                .stream().map(PlanoAcaoResponseDTO::new).toList();
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private void validarDescricao(boolean resposta, String descricao, String campo) {
        if (resposta && (descricao == null || descricao.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Descreva " + campo + " ao selecionar Sim.");
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> tratarValidacao(MethodArgumentNotValidException exception) {
        String mensagem = exception.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .findFirst().orElse("Confira os dados do plano.");
        return ResponseEntity.badRequest().body(Map.of("Erro", mensagem));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> tratarErro(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(exception.getBody());
    }
}
