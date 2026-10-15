import type {
  Aluno,
  Atendimento,
  NovoAluno,
  NovoAtendimento,
  Session,
} from '../types'
import { ApiError } from './api'

export const session: Session = {
  nome: 'Profissional CLAI',
  email: 'demo@example.com',
  permissoes: [
    'alunos:consultar',
    'alunos:cadastrar',
    'atendimentos:consultar',
    'atendimentos:cadastrar',
  ],
}
// Somente dados fictícios, mantidos em memória. Recarregar a página restaura os exemplos.
const alunos: Aluno[] = [
  {
    idAluno: 1,
    matricula: 'DEMO001',
    nome: 'Ana Oliveira (exemplo)',
    email: 'ana@example.com',
    curso: 'Análise e Desenvolvimento de Sistemas',
    ativo: true,
    dataCadastro: '2026-10-09',
  },
  {
    idAluno: 2,
    matricula: 'DEMO002',
    nome: 'Bruno Santos (exemplo)',
    email: 'bruno@example.com',
    curso: 'Engenharia Civil',
    ativo: true,
    dataCadastro: '2026-10-10',
  },
  {
    idAluno: 3,
    matricula: 'DEMO003',
    nome: 'Clara Lima (exemplo)',
    email: null,
    curso: 'Licenciatura em Matemática',
    ativo: true,
    dataCadastro: '2026-10-12',
  },
  {
    idAluno: 4,
    matricula: 'DEMO004',
    nome: 'Daniel Costa (exemplo)',
    email: 'daniel@example.com',
    curso: 'Técnico em Informática',
    ativo: false,
    dataCadastro: '2026-10-13',
  },
]
const atendimentos: Atendimento[] = [
  {
    idAtendimento: 1,
    idAluno: 1,
    data: '2026-10-10',
    hora: '09:00',
    observacoes:
      'Acolhimento inicial e levantamento das necessidades de acompanhamento. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
  {
    idAtendimento: 2,
    idAluno: 1,
    data: '2026-10-14',
    hora: '14:30',
    observacoes:
      'Orientação sobre recursos de acessibilidade e organização da rotina de estudos. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
  {
    idAtendimento: 3,
    idAluno: 2,
    data: '2026-10-13',
    hora: '10:00',
    observacoes:
      'Acompanhamento pedagógico. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
]
export const getAlunos = () => structuredClone(alunos)
export const getAtendimentos = (id: number) =>
  structuredClone(atendimentos.filter((item) => item.idAluno === id))
export function cadastrarAluno(input: NovoAluno): Aluno {
  if (
    alunos.some(
      (aluno) =>
        aluno.matricula === input.matricula ||
        (input.email &&
          aluno.email?.toLowerCase() === input.email.toLowerCase()),
    )
  ) {
    throw new ApiError('Já existe um aluno com esta matrícula ou e-mail.', 409)
  }
  const aluno = {
    ...input,
    idAluno: alunos.length + 1,
    ativo: true,
    dataCadastro: new Date().toLocaleDateString('en-CA'),
  }
  alunos.push(aluno)
  return structuredClone(aluno)
}
export function cadastrarAtendimento(input: NovoAtendimento): Atendimento {
  const { documentos, ...dados } = input
  if (!alunos.some((aluno) => aluno.idAluno === dados.idAluno))
    throw new ApiError('Aluno não encontrado.', 404)
  const atendimento = {
    ...dados,
    idAtendimento: atendimentos.length + 1,
    profissional: session.nome,
    documentos: documentos.map((file, i) => ({
      id: `${atendimentos.length + 1}-${i}`,
      nome: file.name,
      url: URL.createObjectURL(file),
    })),
  }
  atendimentos.push(atendimento)
  return structuredClone(atendimento)
}
