export type Permission =
  | 'alunos:consultar'
  | 'alunos:cadastrar'
  | 'atendimentos:consultar'
  | 'atendimentos:cadastrar'
  | 'planos:consultar'
  | 'planos:cadastrar'
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

export type NovoPlanoAcao = {
  idAluno: number
  periodoLetivo: string
  periodoIngresso: string | null
  dataNascimento: string | null
  telefoneAluno: string | null
  nomeResponsavel: string | null
  parentescoResponsavel: string | null
  telefoneResponsavel: string | null
  emailResponsavel: string | null
  possuiComorbidade: boolean
  comorbidades: string | null
  usaMedicacaoContinua: boolean
  medicacoes: string | null
  frequentaServicosApoio: boolean
  servicosApoio: string | null
  apresentouDocumentos: boolean
  documentosComprobatorios: string | null
  necessidadesEspecificas: string
  percursoEducacional: string
  principaisDemandas: string
  propostasIntervencao: string
  nomeCoordenador: string
  dataDocumento: string
}

export type PlanoAcao = NovoPlanoAcao & {
  idPlanoAcao: number
  autorNome: string
  dataCriacao: string
}
