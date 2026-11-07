CREATE TABLE IF NOT EXISTS pei (
    id BIGSERIAL PRIMARY KEY,
    aluno_matricula VARCHAR(20) NOT NULL,
    semestre_letivo VARCHAR(10),
    data_elaboracao DATE,
    necessidades_especificas TEXT,
    habilidades_potenciais TEXT,
    objetivos_pedagogicos TEXT,
    CONSTRAINT fk_pei_aluno FOREIGN KEY (aluno_matricula)
    REFERENCES aluno(matricula) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS afinidades_pei (
    id_afinidades BIGSERIAL PRIMARY KEY,
    afinidadee VARCHAR(255) NOT NULL,
    pei_id BIGINT NOT NULL,
    CONSTRAINT fk_afinidades_pei FOREIGN KEY (pei_id)
    REFERENCES pei(id) ON DELETE CASCADE
    );