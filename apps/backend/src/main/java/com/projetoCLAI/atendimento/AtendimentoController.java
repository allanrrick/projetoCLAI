package com.projetoCLAI.atendimento;

import com.projetoCLAI.aluno.Aluno;
import com.projetoCLAI.aluno.AlunoRepository;
import com.projetoCLAI.atendimento.atendimentoDTO.AtendimentoResponseDTO;
import com.projetoCLAI.atendimento.atendimentoDTO.CadastroAtendimentoDTO;
import com.projetoCLAI.auth.AuthController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/atendimentos")
@RequiredArgsConstructor
public class AtendimentoController {

    private final AtendimentoRepository atendimentoRepository;
    private final AlunoRepository alunoRepository;
    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AtendimentoResponseDTO> registrarAtendimento(
            @ModelAttribute @Valid CadastroAtendimentoDTO dto,
            HttpServletRequest request) {
        if (!alunoRepository.existsByMatricula(dto.matricula())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com a matrícula: " + dto.matricula());
        }

        Aluno aluno = alunoRepository.findByMatricula(dto.matricula());
        if (aluno == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com a matrícula: " + dto.matricula());
        }

        String caminhoArquivo = fileStorageService.salvarFicheiro(dto.documento());

        HttpSession session = request.getSession(false);
        String profissional = session != null
                ? (String) session.getAttribute(AuthController.ATTR_USUARIO_NOME)
                : null;

        Atendimento atendimento = new Atendimento(
                dto.data().trim(),
                dto.hora().trim(),
                dto.observacoes().trim(),
                caminhoArquivo,
                aluno,
                profissional
        );
        Atendimento salvo = atendimentoRepository.save(atendimento);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AtendimentoResponseDTO(salvo));
    }

    @GetMapping
    public ResponseEntity<List<AtendimentoResponseDTO>> listarTodos() {
        List<AtendimentoResponseDTO> atendimentos = atendimentoRepository.findAll()
                .stream()
                .map(AtendimentoResponseDTO::new)
                .toList();
        return ResponseEntity.ok(atendimentos);
    }

    @GetMapping("/{matricula}")
    public ResponseEntity<List<Atendimento>> listarPorMatricula(@PathVariable String matricula) {
        if (!alunoRepository.existsByMatricula(matricula)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com a matrícula: " + matricula);
        }

        List<Atendimento> atendimentos = atendimentoRepository.findByAlunoMatricula(matricula);
        return ResponseEntity.ok(atendimentos);
    }

    @GetMapping("/documentos/{nomeFicheiro:.+}")
    public ResponseEntity<Resource> descarregarDocumento(@PathVariable String nomeFicheiro) {
        try {
            Path baseDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path caminho = baseDir.resolve(nomeFicheiro).normalize();
            if (!caminho.startsWith(baseDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caminho de documento inválido");
            }
            Resource recurso = new UrlResource(caminho.toUri());

            if (!recurso.exists() || !recurso.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + recurso.getFilename() + "\"")
                    .body(recurso);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao aceder ao documento", e);
        }
    }
}