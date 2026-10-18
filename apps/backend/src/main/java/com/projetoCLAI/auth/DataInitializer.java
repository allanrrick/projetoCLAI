package com.projetoCLAI.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final UsuarioRepository usuarioRepository;

    public DataInitializer(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (!usuarioRepository.existsByEmailIgnoreCase("coordenacao@clai.ifpb.edu.br")) {
                usuarioRepository.save(new Usuario(
                        "Profissional CLAI",
                        "coordenacao@clai.ifpb.edu.br",
                        SenhaHasher.hash("clai123456"),
                        PerfilUsuario.PROFISSIONAL_CLAI.name()
                ));
            }
            if (!usuarioRepository.existsByEmailIgnoreCase("consulta@clai.ifpb.edu.br")) {
                usuarioRepository.save(new Usuario(
                        "Assistente Acadêmico",
                        "consulta@clai.ifpb.edu.br",
                        SenhaHasher.hash("clai123456"),
                        PerfilUsuario.ASSISTENTE.name()
                ));
            }
        } catch (Exception e) {
            log.warn("Não foi possível inicializar usuários padrão no banco: {}", e.getMessage());
        }
    }
}

