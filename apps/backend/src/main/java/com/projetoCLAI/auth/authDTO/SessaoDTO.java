package com.projetoCLAI.auth.authDTO;

import java.util.List;

public record SessaoDTO(
        String nome,
        String email,
        String perfil,
        List<String> permissoes,
        String csrfToken,
        String csrfHeaderName
) {}

