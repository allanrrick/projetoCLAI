package com.projetoCLAI.pei.peiDTO;

import com.projetoCLAI.pei.Pei;

public record PeiResponseDTO(
        Long id,
        Long idAluno,
        String matricula,
        String necessidadesEspecificas,
        String objetivos,
        String estrategiasAcompanhamento
) {
    public PeiResponseDTO(Pei pei) {
        this(
                pei.getId(),
                pei.getAluno().getIdAluno(),
                pei.getAluno().getMatricula(),
                pei.getNecessidadesEspecificas(),
                pei.getObjetivos(),
                pei.getEstrategiasAcompanhamento()
        );
    }
}
