package com.projetoCLAI.auth;

import java.util.List;

public enum PerfilUsuario {
    PROFISSIONAL_CLAI(List.of(
            "alunos:consultar",
            "alunos:cadastrar",
            "atendimentos:consultar",
            "atendimentos:cadastrar",
            "planos:consultar",
            "planos:cadastrar"
    )),
    ASSISTENTE(List.of(
            "alunos:consultar"
    ));

    private final List<String> permissoes;

    PerfilUsuario(List<String> permissoes) {
        this.permissoes = permissoes;
    }

    public List<String> getPermissoes() {
        return permissoes;
    }

    public static PerfilUsuario fromString(String valor) {
        if (valor == null || valor.isBlank()) {
            return PROFISSIONAL_CLAI;
        }
        String normalizado = valor.trim().toUpperCase();
        if ("ASSISTENTE".equals(normalizado) || "CONSULTA".equals(normalizado)) {
            return ASSISTENTE;
        }
        return PROFISSIONAL_CLAI;
    }
}

