package com.projetoCLAI.relatorio.controller;

import com.projetoCLAI.relatorio.RelatorioAcompanhamento;
import com.projetoCLAI.relatorio.dto.CriarRelatorioDTO;
import com.projetoCLAI.relatorio.service.RelatorioAcompanhamentoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/relatorios")
public class RelatorioAcompanhamentoController {

    private final RelatorioAcompanhamentoService relatorioService;

    public RelatorioAcompanhamentoController(
            RelatorioAcompanhamentoService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @PostMapping
    public ResponseEntity<RelatorioAcompanhamento> cadastrar(
            @Valid @RequestBody CriarRelatorioDTO dto) {

        RelatorioAcompanhamento relatorio =
                relatorioService.cadastrar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(relatorio);
    }

    @GetMapping
    public ResponseEntity<List<RelatorioAcompanhamento>> listarTodos() {
        return ResponseEntity.ok(relatorioService.listarTodos());
    }
}