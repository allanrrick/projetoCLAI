package com.projetoCLAI.atendimento;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar a pasta de uploads", e);
        }
    }

    public String salvarFicheiro(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String nomeOriginal = file.getOriginalFilename();
            String nomeLimpo = "documento";
            if (nomeOriginal != null && !nomeOriginal.isBlank()) {
                nomeLimpo = Paths.get(nomeOriginal).getFileName().toString()
                        .replaceAll("[^a-zA-Z0-9._-]", "_");
            }
            String novoNome = UUID.randomUUID() + "_" + nomeLimpo;

            Path destino = this.uploadDir.resolve(novoNome);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            return destino.toString();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao guardar o ficheiro", e);
        }
    }
}