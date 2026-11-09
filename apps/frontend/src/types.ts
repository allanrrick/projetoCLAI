export type Permission =
  | 'alunos:consultar'
  | 'alunos:cadastrar'
  | 'atendimentos:consultar'
  | 'atendimentos:cadastrar'
export type PerfilAcesso = 'PROFISSIONAL_CLAI' | 'ASSISTENTE'
export type Session = {
  nome: string
  email: string
  perfil?: PerfilAcesso
  permissoes: Permission[]
  csrfToken?: string
  csrfHeaderName?: string
}
export type NovoUsuario = {
  nome: string
  email: string
  senha: string
  perfil?: PerfilAcesso
}
export type Aluno = {
  idAluno: number
  matricula: string
  nome: string
  email: string | null
  curso: string
  ativo: boolean
  dataCadastro: string | null
}
export type NovoAluno = Pick<Aluno, 'matricula' | 'nome' | 'curso'> & {
  email: string | null
}
export type Documento = { id: string; nome: string; url?: string }
export type Atendimento = {
  idAtendimento: number
  idAluno: number
  data: string
  hora: string
  observacoes: string
  profissional: string
  documentos: Documento[]
}
export type HistoricoParams = {
  q?: string
  inicio?: string
  fim?: string
  ordem?: 'asc' | 'desc'
}
export type NovoAtendimento = Pick<
  Atendimento,
  'idAluno' | 'data' | 'hora' | 'observacoes'
> & {
  matricula: string
  documentos: File[]
}
export type GrupoAspecto = 'RELACIONAMENTO' | 'COGNITIVO' | 'SOCIOEMOCIONAL'
export type NivelAprendizado = 'SATISFATORIO' | 'BOM' | 'OTIMO'
export type RelatorioAspecto = {
  id?: number
  grupo: GrupoAspecto
  opcao: string
  descricaoOutros?: string | null
}
export type RelatorioHabilidade = {
  id?: number
  ordem: number
  habilidadeDesenvolvida: string
  nivelAprendizado: NivelAprendizado
  observacoes?: string | null
}
export type RelatorioAcompanhamento = {
  id: number
  alunoId: number
  periodoLetivo: string
  componenteCurricular: string
  docente: string
  comentarioRelacionamento?: string | null
  comentarioCognitivo?: string | null
  comentarioSocioemocional?: string | null
  avancosGerais?: string | null
  relatoDificuldades?: string | null
  fatoresExternos?: string | null
  aspectos: RelatorioAspecto[]
  habilidades: RelatorioHabilidade[]
  parecer: string
  dataRelatorio: string
}
export type NovoRelatorio = Omit<RelatorioAcompanhamento, 'id'>
export type PeiAfinidade = {
  id?: number
  afinidade: string
}
export type Pei = {
  id: number
  alunoMatricula: string
  periodoLetivo: string
  historico: string
  necessidadesEspecificas: string
  afinidades: PeiAfinidade[]
  dificuldades: string
  propostasAdaptacao: string
  dataCriacao: string
}
export type NovoPei = {
  alunoMatricula: string
  periodoLetivo: string
  historico: string
  necessidades: string
  afinidades: { afinidade: string }[]
  dificuldades: string
  propostas: string
}
export type Pea = {
  id: number
  alunoMatricula: string
  disciplina: string
  periodoLetivo: string
  docente: string
  objetivos: string
  conteudos: string
  estrategiasEnsino: string
  avaliacaoAdaptada: string
  dataCriacao: string
}
export type NovoPea = Omit<Pea, 'id' | 'dataCriacao'>
