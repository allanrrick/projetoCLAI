package com.projetoCLAI.auth;

import java.util.List;

public enum PerfilUsuario {

    PROFISSIONAL_CLAI(List.of(
            "alunos:consultar",
            "alunos:cadastrar",
            "alunos:editar",
            "alunos:desativar",
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
            throw new IllegalArgumentException(
                    "Perfil de usuário não informado."
            );
        }

        String normalizado = valor.trim().toUpperCase();

        return switch (normalizado) {
            case "PROFISSIONAL_CLAI" -> PROFISSIONAL_CLAI;
            case "ASSISTENTE", "CONSULTA" -> ASSISTENTE;
            default -> throw new IllegalArgumentException(
                    "Perfil de usuário inválido."
            );
        };
    }
}
