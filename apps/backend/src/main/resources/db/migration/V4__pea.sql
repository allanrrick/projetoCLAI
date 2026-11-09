CREATE TABLE IF NOT EXISTS pea (
    id BIGSERIAL PRIMARY KEY,
    aluno_matricula VARCHAR(20) NOT NULL,
    disciplina VARCHAR(150) NOT NULL,
    periodo_letivo VARCHAR(50) NOT NULL,
    docente VARCHAR(150) NOT NULL,
    objetivos TEXT NOT NULL,
    conteudos TEXT NOT NULL,
    estrategias_ensino TEXT NOT NULL,
    avaliacao_adaptada TEXT NOT NULL,
    data_criacao DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_pea_aluno
        FOREIGN KEY (aluno_matricula)
        REFERENCES aluno(matricula)
        ON DELETE CASCADE
);
