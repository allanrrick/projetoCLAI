export type Permission =
  | 'alunos:consultar'
  | 'alunos:cadastrar'
  | 'atendimentos:consultar'
  | 'atendimentos:cadastrar'
export type Session = {
  nome: string
  email: string
  permissoes: Permission[]
  csrfToken?: string
  csrfHeaderName?: string
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
export type NovoAtendimento = Pick<
  Atendimento,
  'idAluno' | 'data' | 'hora' | 'observacoes'
> & { documentos: File[] }
